#!/usr/bin/env python3
"""
Quiz Manager for Czech Citizenship Test
Manages question selection, state tracking, and statistics.
"""

import json
import random
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Paths
SKILL_DIR = Path(__file__).parent.parent
STATE_FILE = SKILL_DIR / "state.json"
# DB file is in project root (4 levels up from scripts/)
DB_FILE = SKILL_DIR.parent.parent.parent / "databanka-otazek-obcanstvi.md"


class Question:
    """Represents a single quiz question."""

    def __init__(self, question_id: str, section: str, text: str,
                 options: Dict[str, str], correct_answer: str):
        self.id = question_id
        self.section = section
        self.text = text
        self.options = options  # {'A': 'text', 'B': 'text', ...}
        self.correct_answer = correct_answer


class QuizState:
    """Manages the quiz state."""

    def __init__(self):
        self.correct: List[str] = []
        self.incorrect: List[str] = []
        self.total_attempts: int = 0
        self.started_at: Optional[str] = None
        self.last_updated: Optional[str] = None
        self.last_question_id: Optional[str] = None

    @classmethod
    def load(cls) -> 'QuizState':
        """Load state from file or create new."""
        if STATE_FILE.exists():
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            state = cls()
            state.correct = data.get('correct', [])
            state.incorrect = data.get('incorrect', [])
            state.total_attempts = data.get('total_attempts', 0)
            state.started_at = data.get('started_at')
            state.last_updated = data.get('last_updated')
            state.last_question_id = data.get('last_question_id')
            return state
        return cls()

    def save(self):
        """Save state to file."""
        if self.started_at is None:
            self.started_at = datetime.now().isoformat()
        self.last_updated = datetime.now().isoformat()

        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'correct': self.correct,
                'incorrect': self.incorrect,
                'total_attempts': self.total_attempts,
                'started_at': self.started_at,
                'last_updated': self.last_updated,
                'last_question_id': self.last_question_id
            }, f, ensure_ascii=False, indent=2)

    def record_answer(self, question_id: str, is_correct: bool):
        """Record an answer."""
        self.total_attempts += 1

        if is_correct:
            if question_id not in self.correct:
                self.correct.append(question_id)
            # Remove from incorrect if it was there
            if question_id in self.incorrect:
                self.incorrect.remove(question_id)
        else:
            if question_id not in self.incorrect:
                self.incorrect.append(question_id)

        self.save()

    def reset(self):
        """Reset all progress."""
        self.correct = []
        self.incorrect = []
        self.total_attempts = 0
        self.started_at = None
        self.last_updated = None
        self.last_question_id = None
        self.save()


class QuizDatabase:
    """Parses and manages the question database."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.questions: Dict[str, Question] = {}
        self._parse_database()

    def _parse_database(self):
        """Parse the markdown database file."""
        with open(self.db_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split by sections (### header)
        sections = re.split(r'\n### (\d+\. [^\n]+)\n', content)

        for i in range(1, len(sections), 2):
            section_header = sections[i].strip()
            section_content = sections[i + 1] if i + 1 < len(sections) else ""

            # Extract section number
            section_match = re.match(r'(\d+)\.', section_header)
            if not section_match:
                continue
            section_num = section_match.group(1)

            # Find correct answers line
            correct_answers_match = re.search(
                r'\*\*SPRÁVNÉ ŘEŠENÍ:\s*(.+?)\*\*',
                section_content
            )
            if not correct_answers_match:
                continue

            # Parse correct answers (format: "1C, 2A, 3D, ...")
            correct_answers_str = correct_answers_match.group(1)
            correct_answers = {}
            for answer_pair in correct_answers_str.split(','):
                match = re.match(r'(\d+)([A-D])', answer_pair.strip())
                if match:
                    q_num, answer = match.groups()
                    correct_answers[q_num] = answer

            # Split content before correct answers
            questions_content = section_content[:correct_answers_match.start()]

            # Parse individual questions
            # Format: "1. Question text?\nA) Option A.\nB) Option B.\n..."
            question_blocks = re.split(r'\n(\d+)\.\s', questions_content)

            for j in range(1, len(question_blocks), 2):
                q_num = question_blocks[j].strip()
                q_content = question_blocks[j + 1] if j + 1 < len(question_blocks) else ""

                if not q_content.strip():
                    continue

                # Parse question text and options
                lines = q_content.strip().split('\n')
                question_text_lines = []
                options = {}

                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Check if it's an option line (A), B), C), D))
                    option_match = re.match(r'^([A-D])\)\s*(.+)$', line)
                    if option_match:
                        opt_letter, opt_text = option_match.groups()
                        options[opt_letter] = opt_text
                    else:
                        question_text_lines.append(line)

                question_text = ' '.join(question_text_lines)

                # Create question object
                question_id = f"{section_num}.{q_num}"
                correct_answer = correct_answers.get(q_num, '')

                if question_text and options and correct_answer:
                    self.questions[question_id] = Question(
                        question_id=question_id,
                        section=section_header,
                        text=question_text,
                        options=options,
                        correct_answer=correct_answer
                    )

    def get_question(self, question_id: str) -> Optional[Question]:
        """Get a specific question by ID."""
        return self.questions.get(question_id)

    def get_all_question_ids(self) -> List[str]:
        """Get all question IDs."""
        return list(self.questions.keys())

    def get_unanswered_questions(self, state: QuizState) -> List[str]:
        """Get list of question IDs that haven't been correctly answered."""
        all_ids = self.get_all_question_ids()
        return [qid for qid in all_ids if qid not in state.correct]


def format_question(question: Question) -> str:
    """Format a question for display."""
    output = []
    output.append(f"\n📝 Otázka {question.id} ({question.section})")
    output.append(question.text)
    output.append("")

    for letter in sorted(question.options.keys()):
        output.append(f"{letter}) {question.options[letter]}")

    return "\n".join(output)


def get_next_question(db: QuizDatabase, state: QuizState) -> Optional[Question]:
    """Get next random unanswered question."""
    unanswered = db.get_unanswered_questions(state)

    if not unanswered:
        return None

    # Exclude the last question to avoid immediate repetition
    if state.last_question_id and state.last_question_id in unanswered:
        available = [qid for qid in unanswered if qid != state.last_question_id]
        # If there's only one question left, we have to show it again
        if not available:
            available = unanswered
    else:
        available = unanswered

    # Prioritize questions that were answered incorrectly
    priority_questions = [qid for qid in available if qid in state.incorrect]

    if priority_questions:
        question_id = random.choice(priority_questions)
    else:
        question_id = random.choice(available)

    # Save this question as the last one shown
    state.last_question_id = question_id
    state.save()

    return db.get_question(question_id)


def show_stats(db: QuizDatabase, state: QuizState):
    """Display statistics."""
    total = len(db.get_all_question_ids())
    correct_count = len(state.correct)
    incorrect_count = len(state.incorrect)
    unanswered_count = total - correct_count

    if state.total_attempts > 0:
        success_rate = (correct_count / state.total_attempts) * 100
    else:
        success_rate = 0

    print("\n📊 STATISTIKY")
    print("=" * 50)
    print(f"Celkem otázek:           {total}")
    print(f"Správně zodpovězeno:     {correct_count} ({correct_count/total*100:.1f}%)")
    print(f"Špatně zodpovězeno:      {incorrect_count}")
    print(f"Zbývá zodpovědět:        {unanswered_count}")
    print(f"Celkem pokusů:           {state.total_attempts}")
    print(f"Úspěšnost:               {success_rate:.1f}%")

    if state.started_at:
        print(f"\nZahájeno:                {state.started_at[:19]}")
    if state.last_updated:
        print(f"Poslední aktualizace:    {state.last_updated[:19]}")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: quiz_manager.py [next|answer|stats|reset]", file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]

    # Load state and database
    state = QuizState.load()
    db = QuizDatabase(DB_FILE)

    if command == "next":
        question = get_next_question(db, state)
        if question is None:
            print("\n🎉 GRATULUJEME! Zodpověděli jste všechny otázky správně!")
            show_stats(db, state)
        else:
            print(format_question(question))
            print(f"\n📊 Pokrok: {len(state.correct)}/{len(db.get_all_question_ids())} otázek")

    elif command == "answer":
        if len(sys.argv) < 4:
            print("Usage: quiz_manager.py answer <question_id> <answer>", file=sys.stderr)
            sys.exit(1)

        question_id = sys.argv[2]
        user_answer = sys.argv[3].upper()

        question = db.get_question(question_id)
        if question is None:
            print(f"Error: Question {question_id} not found", file=sys.stderr)
            sys.exit(1)

        is_correct = (user_answer == question.correct_answer)
        state.record_answer(question_id, is_correct)

        # Output result as JSON for easy parsing
        result = {
            "correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": question.correct_answer,
            "correct_text": question.options.get(question.correct_answer, ""),
            "stats": {
                "correct": len(state.correct),
                "total": len(db.get_all_question_ids()),
                "attempts": state.total_attempts
            }
        }
        print(json.dumps(result, ensure_ascii=False))

    elif command == "stats":
        show_stats(db, state)

    elif command == "reset":
        state.reset()
        print("\n✅ Stav testu byl resetován.")
        print(f"Celkem otázek: {len(db.get_all_question_ids())}")

    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
