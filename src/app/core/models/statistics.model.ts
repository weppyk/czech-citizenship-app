export interface Statistics {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  successRate: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  sectionStats: SectionStats[];
}

export interface SectionStats {
  sectionNumber: number;
  sectionName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  successRate: number;
}
