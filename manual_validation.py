#!/usr/bin/env python3
"""
Manual validation helper - extracts questions by section from local database
for comparison with official source.
"""

import json
import sys

def load_database(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_section_questions(questions, section_num):
    """Get all questions for a specific section."""
    section_qs = [q for q in questions if q['sectionNumber'] == section_num]
    return sorted(section_qs, key=lambda x: x['questionNumber'])

def print_section_summary(section_num, questions):
    """Print summary of section questions with correct answers."""
    section_qs = get_section_questions(questions, section_num)

    if not section_qs:
        print(f"No questions found for section {section_num}")
        return

    print(f"\n{'='*80}")
    print(f"SECTION {section_num}: {section_qs[0]['sectionName']}")
    print(f"Total Questions: {len(section_qs)}")
    print(f"{'='*80}\n")

    for q in section_qs:
        print(f"Question {q['questionNumber']} (ID: {q['id']})")
        print(f"Text: {q['text']}")
        print(f"Correct Answer: {q['correctAnswer']}")

        # Show the correct option text
        correct_option = next((opt for opt in q['options'] if opt['letter'] == q['correctAnswer']), None)
        if correct_option:
            print(f"Answer Text: {correct_option['text']}")
        print("-" * 80)

    # Summary line for easy validation
    print("\nQUICK REFERENCE:")
    answers = [f"Q{q['questionNumber']}:{q['correctAnswer']}" for q in section_qs]
    print(" | ".join(answers))
    print()

def main():
    database_path = "/Users/radekdrlik/_my_projects/my-home-claude/czech-citizenship-test/src/assets/data/questions.json"

    questions = load_database(database_path)

    if len(sys.argv) > 1:
        # Print specific section
        section_num = int(sys.argv[1])
        print_section_summary(section_num, questions)
    else:
        # Print all sections
        for section_num in range(1, 31):
            print_section_summary(section_num, questions)

if __name__ == "__main__":
    main()
