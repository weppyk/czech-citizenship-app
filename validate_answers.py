#!/usr/bin/env python3
"""
Comprehensive validation script for Czech citizenship test database.
Validates all 300 questions against the official source.
"""

import json
import requests
from bs4 import BeautifulSoup
import re
import time
from typing import Dict, List, Tuple

# Base URL for official source
BASE_URL = "https://cestina-pro-cizince.cz/obcanstvi/databanka-uloh/"

# Section URLs (1-30)
SECTION_URLS = {i: f"{BASE_URL}{i}/" for i in range(1, 31)}

class ValidationReport:
    def __init__(self):
        self.total_validated = 0
        self.errors = []
        self.sections_validated = []
        self.sections_with_errors = []

    def add_error(self, section: int, question_id: str, question_text: str,
                  our_answer: str, correct_answer: str, details: str = ""):
        self.errors.append({
            'section': section,
            'question_id': question_id,
            'question_text': question_text,
            'our_answer': our_answer,
            'correct_answer': correct_answer,
            'details': details
        })
        if section not in self.sections_with_errors:
            self.sections_with_errors.append(section)

    def add_validated(self, section: int, count: int):
        self.total_validated += count
        if section not in self.sections_validated:
            self.sections_validated.append(section)

    def get_accuracy_rate(self) -> float:
        if self.total_validated == 0:
            return 0.0
        return ((self.total_validated - len(self.errors)) / self.total_validated) * 100

    def print_report(self):
        print("\n" + "="*80)
        print("CZECH CITIZENSHIP TEST - COMPREHENSIVE VALIDATION REPORT")
        print("="*80)

        if self.errors:
            print(f"\n*** ERRORS FOUND: {len(self.errors)} ***\n")
            print("-"*80)
            for idx, error in enumerate(self.errors, 1):
                print(f"\nERROR #{idx}:")
                print(f"  Section: {error['section']}")
                print(f"  Question ID: {error['question_id']}")
                print(f"  Question: {error['question_text'][:100]}...")
                print(f"  Our Answer: {error['our_answer']}")
                print(f"  Correct Answer: {error['correct_answer']}")
                if error['details']:
                    print(f"  Details: {error['details']}")
                print("-"*80)
        else:
            print("\n*** NO ERRORS FOUND - ALL ANSWERS MATCH! ***\n")

        print("\n" + "="*80)
        print("SUMMARY STATISTICS")
        print("="*80)
        print(f"Total Questions Validated: {self.total_validated}")
        print(f"Errors Found: {len(self.errors)}")
        print(f"Correct Answers: {self.total_validated - len(self.errors)}")
        print(f"Accuracy Rate: {self.get_accuracy_rate():.2f}%")
        print(f"Sections Validated: {len(self.sections_validated)}/30")

        if self.sections_with_errors:
            print(f"\nSections with Errors: {sorted(self.sections_with_errors)}")

        sections_perfect = [s for s in self.sections_validated if s not in self.sections_with_errors]
        if sections_perfect:
            print(f"\nSections with 100% Accuracy: {sorted(sections_perfect)}")
        print("="*80)


def load_local_database(filepath: str) -> Dict:
    """Load the local questions database."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def fetch_official_section(section_num: int) -> str:
    """Fetch HTML content from official source for a specific section."""
    url = SECTION_URLS[section_num]
    print(f"Fetching section {section_num} from {url}...")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"ERROR fetching section {section_num}: {e}")
        return None


def parse_official_questions(html: str, section_num: int) -> List[Dict]:
    """Parse questions from official HTML."""
    soup = BeautifulSoup(html, 'html.parser')
    questions = []

    # Find all question blocks
    question_blocks = soup.find_all('div', class_='question-block')

    if not question_blocks:
        # Try alternative parsing methods
        question_blocks = soup.find_all(['div', 'article'], class_=re.compile(r'question|otazka|uloha'))

    for block in question_blocks:
        try:
            # Extract question number and text
            question_text_elem = block.find(['h3', 'h4', 'p', 'div'], class_=re.compile(r'question-text|otazka-text|text'))
            if not question_text_elem:
                question_text_elem = block.find(['h3', 'h4', 'p'])

            if not question_text_elem:
                continue

            question_text = question_text_elem.get_text(strip=True)

            # Extract question number from text
            number_match = re.match(r'(\d+)[\.\)]\s*(.*)', question_text)
            if number_match:
                question_num = int(number_match.group(1))
                question_text = number_match.group(2)
            else:
                continue

            # Extract options
            options = []
            option_elems = block.find_all(['li', 'div', 'p'], class_=re.compile(r'option|odpoved|answer'))

            if not option_elems:
                # Try finding by list items
                option_list = block.find(['ul', 'ol'])
                if option_list:
                    option_elems = option_list.find_all('li')

            for opt in option_elems:
                opt_text = opt.get_text(strip=True)
                # Extract option letter (A, B, C, D)
                opt_match = re.match(r'([A-D])[\.\)]\s*(.*)', opt_text)
                if opt_match:
                    options.append({
                        'letter': opt_match.group(1),
                        'text': opt_match.group(2)
                    })

            # Extract correct answer
            correct_elem = block.find(['span', 'div', 'p'], class_=re.compile(r'correct|spravna|answer-key'))
            if not correct_elem:
                # Try finding in hidden or data attributes
                correct_elem = block.find(attrs={'data-correct': True})
                if correct_elem:
                    correct_answer = correct_elem.get('data-correct', '').strip()
                else:
                    # Look for text patterns
                    all_text = block.get_text()
                    correct_match = re.search(r'[Ss]právná odpověď[:\s]+([A-D])', all_text)
                    if correct_match:
                        correct_answer = correct_match.group(1)
                    else:
                        correct_answer = None
            else:
                correct_text = correct_elem.get_text(strip=True)
                correct_match = re.search(r'([A-D])', correct_text)
                correct_answer = correct_match.group(1) if correct_match else None

            if correct_answer:
                questions.append({
                    'number': question_num,
                    'text': question_text,
                    'options': options,
                    'correct_answer': correct_answer
                })
        except Exception as e:
            print(f"Warning: Error parsing question in section {section_num}: {e}")
            continue

    return questions


def validate_section(local_questions: List[Dict], section_num: int, report: ValidationReport) -> None:
    """Validate all questions in a section against official source."""
    html = fetch_official_section(section_num)
    if not html:
        print(f"FAILED to fetch section {section_num}")
        return

    official_questions = parse_official_questions(html, section_num)

    if not official_questions:
        print(f"WARNING: No questions parsed from section {section_num}")
        print("This may require manual verification of the parsing logic.")
        return

    # Create mapping of official questions by number
    official_map = {q['number']: q for q in official_questions}

    # Validate each local question
    section_questions = [q for q in local_questions if q['sectionNumber'] == section_num]
    validated_count = 0

    for local_q in section_questions:
        question_num = local_q['questionNumber']

        if question_num not in official_map:
            report.add_error(
                section_num,
                local_q['id'],
                local_q['text'],
                local_q['correctAnswer'],
                "UNKNOWN",
                f"Question {question_num} not found in official source"
            )
            continue

        official_q = official_map[question_num]

        # Compare correct answers
        if local_q['correctAnswer'] != official_q['correct_answer']:
            report.add_error(
                section_num,
                local_q['id'],
                local_q['text'],
                local_q['correctAnswer'],
                official_q['correct_answer'],
                "Answer mismatch"
            )

        validated_count += 1

    report.add_validated(section_num, validated_count)
    print(f"Section {section_num}: Validated {validated_count} questions, Found {len([e for e in report.errors if e['section'] == section_num])} errors")

    # Brief pause to be respectful to the server
    time.sleep(0.5)


def main():
    """Main validation process."""
    database_path = "/Users/radekdrlik/_my_projects/my-home-claude/czech-citizenship-test/src/assets/data/questions.json"

    print("Loading local database...")
    local_questions = load_local_database(database_path)
    print(f"Loaded {len(local_questions)} questions from local database\n")

    report = ValidationReport()

    # Validate all 30 sections
    for section_num in range(1, 31):
        print(f"\n{'='*60}")
        print(f"VALIDATING SECTION {section_num}/30")
        print(f"{'='*60}")
        validate_section(local_questions, section_num, report)

    # Print final report
    report.print_report()

    # Save detailed error report to file
    if report.errors:
        error_file = "/Users/radekdrlik/_my_projects/my-home-claude/czech-citizenship-test/validation_errors.json"
        with open(error_file, 'w', encoding='utf-8') as f:
            json.dump(report.errors, f, ensure_ascii=False, indent=2)
        print(f"\nDetailed error report saved to: {error_file}")


if __name__ == "__main__":
    main()
