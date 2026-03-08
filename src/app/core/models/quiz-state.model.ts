import { AnsweredQuestion } from './question.model';

export interface QuizState {
  currentQuestionId: string | null;
  answeredQuestions: AnsweredQuestion[];
  correctAnswers: string[];
  incorrectAnswers: string[];
  totalAttempts: number;
  startedAt: string | null;
  lastUpdatedAt: string | null;
  lastQuestionId: string | null;
  sessionStartTime: number | null;
}

export const initialQuizState: QuizState = {
  currentQuestionId: null,
  answeredQuestions: [],
  correctAnswers: [],
  incorrectAnswers: [],
  totalAttempts: 0,
  startedAt: null,
  lastUpdatedAt: null,
  lastQuestionId: null,
  sessionStartTime: null,
};
