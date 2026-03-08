import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Question, AnsweredQuestion } from '../models/question.model';
import { QuizState, initialQuizState } from '../models/quiz-state.model';
import { Statistics, SectionStats } from '../models/statistics.model';
import { StorageService } from './storage.service';

export type QuizMode = 'all' | 'incorrect';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private questionsSignal = signal<Question[]>([]);
  private quizStateSignal = signal<QuizState>(initialQuizState);
  private currentQuestionStartTime = signal<number | null>(null);
  private quizModeSignal = signal<QuizMode>('all');

  questions = this.questionsSignal.asReadonly();
  quizState = this.quizStateSignal.asReadonly();
  quizMode = this.quizModeSignal.asReadonly();

  currentQuestion = computed(() => {
    const currentId = this.quizState().currentQuestionId;
    if (!currentId) return null;
    return this.questions().find(q => q.id === currentId) || null;
  });

  statistics = computed((): Statistics => {
    const state = this.quizState();
    const questions = this.questions();
    const totalQuestions = questions.length;
    const answeredQuestions = state.answeredQuestions.length;
    const correctAnswers = state.correctAnswers.length;
    const incorrectAnswers = state.incorrectAnswers.length;
    const unansweredQuestions = totalQuestions - answeredQuestions;
    const successRate = totalQuestions > 0
      ? (correctAnswers / totalQuestions) * 100
      : 0;

    const totalTimeSpent = state.answeredQuestions.reduce(
      (sum, q) => sum + q.timeSpentSeconds,
      0
    );
    const averageTimePerQuestion = answeredQuestions > 0
      ? totalTimeSpent / answeredQuestions
      : 0;

    const sectionStats = this.calculateSectionStats(questions, state);

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      successRate,
      totalTimeSpent,
      averageTimePerQuestion,
      sectionStats,
    };
  });

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.loadQuestions();
    this.loadQuizState();

    effect(() => {
      const state = this.quizState();
      this.storageService.saveQuizState(state);
    });
  }

  private async loadQuestions(): Promise<void> {
    try {
      const questions = await firstValueFrom(
        this.http.get<Question[]>('/assets/data/questions.json')
      );
      this.questionsSignal.set(questions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      throw error;
    }
  }

  private async loadQuizState(): Promise<void> {
    try {
      const state = await this.storageService.getQuizState();
      this.quizStateSignal.set(state);
    } catch (error) {
      console.error('Failed to load quiz state:', error);
    }
  }

  setMode(mode: QuizMode): void {
    this.quizModeSignal.set(mode);
  }

  selectRandomIncorrectQuestion(): void {
    const questions = this.questions();
    const state = this.quizState();

    let availableQuestions = questions.filter(
      q => state.incorrectAnswers.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      this.quizStateSignal.update(s => ({ ...s, currentQuestionId: null }));
      return;
    }

    if (state.lastQuestionId && availableQuestions.length > 1) {
      availableQuestions = availableQuestions.filter(
        q => q.id !== state.lastQuestionId
      );
    }

    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    this.quizStateSignal.update(s => ({
      ...s,
      currentQuestionId: selectedQuestion.id,
      lastQuestionId: selectedQuestion.id,
      sessionStartTime: s.sessionStartTime || Date.now(),
      startedAt: s.startedAt || new Date().toISOString(),
    }));

    this.currentQuestionStartTime.set(Date.now());
  }

  selectRandomQuestion(): void {
    const questions = this.questions();
    const state = this.quizState();

    if (questions.length === 0) {
      console.warn('No questions available');
      return;
    }

    let availableQuestions = questions.filter(
      q => !state.correctAnswers.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      console.log('All questions answered correctly!');
      return;
    }

    if (state.lastQuestionId && availableQuestions.length > 1) {
      availableQuestions = availableQuestions.filter(
        q => q.id !== state.lastQuestionId
      );
    }

    // Prioritize new questions (not in incorrectAnswers)
    const incorrectQuestionIds = state.incorrectAnswers;
    const newQuestions = availableQuestions.filter(
      q => !incorrectQuestionIds.includes(q.id)
    );

    let selectedQuestion: Question;
    // If there are new questions, select from them first
    if (newQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * newQuestions.length);
      selectedQuestion = newQuestions[randomIndex];
    } else {
      // Only show incorrect questions when all new questions are exhausted
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      selectedQuestion = availableQuestions[randomIndex];
    }

    this.quizStateSignal.update(state => ({
      ...state,
      currentQuestionId: selectedQuestion.id,
      lastQuestionId: selectedQuestion.id,
      sessionStartTime: state.sessionStartTime || Date.now(),
      startedAt: state.startedAt || new Date().toISOString(),
    }));

    this.currentQuestionStartTime.set(Date.now());
  }

  async submitAnswer(userAnswer: 'A' | 'B' | 'C' | 'D'): Promise<boolean> {
    const currentQ = this.currentQuestion();
    if (!currentQ) {
      console.warn('No current question');
      return false;
    }

    const isCorrect = userAnswer === currentQ.correctAnswer;
    const timeSpent = this.currentQuestionStartTime()
      ? Math.floor((Date.now() - this.currentQuestionStartTime()!) / 1000)
      : 0;

    const answeredQuestion: AnsweredQuestion = {
      questionId: currentQ.id,
      userAnswer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
    };

    await this.storageService.saveAnsweredQuestion(answeredQuestion);

    this.quizStateSignal.update(state => {
      const newAnsweredQuestions = [...state.answeredQuestions];
      const existingIndex = newAnsweredQuestions.findIndex(
        q => q.questionId === currentQ.id
      );

      if (existingIndex >= 0) {
        newAnsweredQuestions[existingIndex] = answeredQuestion;
      } else {
        newAnsweredQuestions.push(answeredQuestion);
      }

      let newCorrectAnswers = [...state.correctAnswers];
      let newIncorrectAnswers = [...state.incorrectAnswers];

      if (isCorrect) {
        if (!newCorrectAnswers.includes(currentQ.id)) {
          newCorrectAnswers.push(currentQ.id);
        }
        newIncorrectAnswers = newIncorrectAnswers.filter(id => id !== currentQ.id);
      } else {
        if (!newIncorrectAnswers.includes(currentQ.id)) {
          newIncorrectAnswers.push(currentQ.id);
        }
      }

      return {
        ...state,
        answeredQuestions: newAnsweredQuestions,
        correctAnswers: newCorrectAnswers,
        incorrectAnswers: newIncorrectAnswers,
        totalAttempts: state.totalAttempts + 1,
        lastUpdatedAt: new Date().toISOString(),
      };
    });

    return isCorrect;
  }

  async resetQuiz(): Promise<void> {
    await this.storageService.resetQuiz();
    this.quizStateSignal.set(initialQuizState);
    this.currentQuestionStartTime.set(null);
  }

  private calculateSectionStats(
    questions: Question[],
    state: QuizState
  ): SectionStats[] {
    const sectionMap = new Map<number, SectionStats>();

    questions.forEach(q => {
      if (!sectionMap.has(q.sectionNumber)) {
        sectionMap.set(q.sectionNumber, {
          sectionNumber: q.sectionNumber,
          sectionName: q.sectionName,
          totalQuestions: 0,
          answeredQuestions: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          successRate: 0,
        });
      }

      const stats = sectionMap.get(q.sectionNumber)!;
      stats.totalQuestions++;

      if (state.correctAnswers.includes(q.id)) {
        stats.answeredQuestions++;
        stats.correctAnswers++;
      } else if (state.incorrectAnswers.includes(q.id)) {
        stats.answeredQuestions++;
        stats.incorrectAnswers++;
      }

      stats.successRate = stats.totalQuestions > 0
        ? (stats.correctAnswers / stats.totalQuestions) * 100
        : 0;
    });

    return Array.from(sectionMap.values()).sort(
      (a, b) => a.sectionNumber - b.sectionNumber
    );
  }
}
