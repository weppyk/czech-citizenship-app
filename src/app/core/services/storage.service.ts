import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { QuizState, initialQuizState } from '../models/quiz-state.model';
import { AnsweredQuestion } from '../models/question.model';
import { AppSettings, defaultSettings } from '../models/app-settings.model';

interface CzechCitizenshipDB extends DBSchema {
  quizState: {
    key: string;
    value: QuizState;
  };
  answeredQuestions: {
    key: string;
    value: AnsweredQuestion;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'czech-citizenship-test';
  private dbVersion = 1;
  private db: IDBPDatabase<CzechCitizenshipDB> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB<CzechCitizenshipDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('quizState')) {
            db.createObjectStore('quizState');
          }
          if (!db.objectStoreNames.contains('answeredQuestions')) {
            db.createObjectStore('answeredQuestions');
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<CzechCitizenshipDB>> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async getQuizState(): Promise<QuizState> {
    try {
      const db = await this.ensureDB();
      const state = await db.get('quizState', 'current');
      return state || initialQuizState;
    } catch (error) {
      console.error('Failed to get quiz state:', error);
      return initialQuizState;
    }
  }

  async saveQuizState(state: QuizState): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('quizState', state, 'current');
    } catch (error) {
      console.error('Failed to save quiz state:', error);
      throw error;
    }
  }

  async getAnsweredQuestion(questionId: string): Promise<AnsweredQuestion | undefined> {
    try {
      const db = await this.ensureDB();
      return await db.get('answeredQuestions', questionId);
    } catch (error) {
      console.error('Failed to get answered question:', error);
      return undefined;
    }
  }

  async saveAnsweredQuestion(question: AnsweredQuestion): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('answeredQuestions', question, question.questionId);
    } catch (error) {
      console.error('Failed to save answered question:', error);
      throw error;
    }
  }

  async getAllAnsweredQuestions(): Promise<AnsweredQuestion[]> {
    try {
      const db = await this.ensureDB();
      return await db.getAll('answeredQuestions');
    } catch (error) {
      console.error('Failed to get all answered questions:', error);
      return [];
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const db = await this.ensureDB();
      const settings = await db.get('settings', 'current');
      return settings || defaultSettings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('settings', settings, 'current');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.clear('quizState');
      await db.clear('answeredQuestions');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  async resetQuiz(): Promise<void> {
    try {
      await this.clearAllData();
      await this.saveQuizState(initialQuizState);
    } catch (error) {
      console.error('Failed to reset quiz:', error);
      throw error;
    }
  }
}
