export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface Question {
  id: string;
  sectionNumber: number;
  sectionName: string;
  questionNumber: number;
  text: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  imageUrl?: string;
  imageAlt?: string;
}

export interface AnsweredQuestion {
  questionId: string;
  userAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  answeredAt: string;
  timeSpentSeconds: number;
}
