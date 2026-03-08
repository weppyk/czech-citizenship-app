import { Component, OnInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService, QuizMode } from '../../core/services/quiz.service';
import { ImageService } from '../../core/services/image.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quiz-container">
      @if (currentQuestion()) {
        <div class="quiz-card">
          @if (quizMode() === 'incorrect') {
            <div class="mode-banner">Procvičování špatných odpovědí</div>
          }
          <div class="quiz-header">
            <div class="section-info">
              <span class="section-number">Sekce {{ currentQuestion()!.sectionNumber }}</span>
              <span class="section-name">{{ currentQuestion()!.sectionName }}</span>
            </div>
            <div class="progress">
              <div class="progress-count">{{ stats().correctAnswers }} / {{ stats().totalQuestions }}</div>
              <div class="progress-percentage">{{ stats().successRate.toFixed(1) }}% správně</div>
              @if (quizMode() === 'incorrect') {
                <div class="progress-count progress-count--error">{{ stats().incorrectAnswers }} špatných zbývá</div>
              }
            </div>
          </div>

          @if (currentQuestion()!.imageUrl) {
            <div class="question-image">
              <img
                [src]="getImageUrl(currentQuestion()!.imageUrl!)"
                [alt]="currentQuestion()!.imageAlt || 'Question image'"
                (click)="openImageModal(currentQuestion()!.imageUrl!)"
              />
            </div>
          }

          <div class="question-text">
            <div class="question-number">Úloha {{ currentQuestion()!.questionNumber }}</div>
            <h2>{{ currentQuestion()!.text }}</h2>
          </div>

          <div class="answer-options" [class.has-images]="currentQuestion()!.options[0]?.imageUrl">
            @for (option of currentQuestion()!.options; track option.letter) {
              <button
                class="option-button"
                [class.selected]="selectedAnswer() === option.letter"
                [class.correct]="showFeedback() && option.letter === currentQuestion()!.correctAnswer"
                [class.incorrect]="showFeedback() && selectedAnswer() === option.letter && !isCorrect()"
                [class.has-image]="option.imageUrl"
                [disabled]="showFeedback()"
                (click)="selectAnswer(option.letter)"
              >
                <span class="option-letter">{{ option.letter }}</span>
                @if (option.imageUrl) {
                  <div class="option-image">
                    <img
                      [src]="getImageUrl(option.imageUrl)"
                      [alt]="option.imageAlt || 'Obrázek možnosti ' + option.letter"
                    />
                  </div>
                }
                @if (option.text) {
                  <span class="option-text">{{ option.text }}</span>
                }
              </button>
            }
          </div>

          @if (showFeedback()) {
            <div class="feedback" [class.correct]="isCorrect()" [class.incorrect]="!isCorrect()">
              <div class="feedback-icon">
                {{ isCorrect() ? '✅' : '❌' }}
              </div>
              <div class="feedback-text">
                @if (isCorrect()) {
                  <strong>Správně!</strong>
                } @else {
                  <strong>Špatně!</strong>
                  <p>Správná odpověď je: <strong>{{ currentQuestion()!.correctAnswer }}</strong></p>
                }
              </div>
              <button class="btn-next" (click)="nextQuestion()">
                Další otázka →
              </button>
            </div>
          }

          <div class="keyboard-hint">
            Použijte klávesy A-D pro rychlou odpověď
          </div>
        </div>
      } @else {
        <div class="no-question">
          @if (quizMode() === 'incorrect') {
            <h2>Hotovo! ✅</h2>
            <p>Procvičili jste všechny špatně zodpovězené otázky.</p>
          } @else {
            <h2>Gratulujeme! 🎉</h2>
            <p>Zodpověděli jste všechny otázky správně!</p>
          }
          <button class="btn-primary" (click)="goHome()">Zpět na úvodní stránku</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: calc(100vh - 120px);
    }

    .quiz-card {
      background: var(--color-surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .mode-banner {
      text-align: center;
      padding: 0.4rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--color-border);
    }

    .section-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .section-number {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .section-name {
      font-size: 0.875rem;
      color: var(--color-primary);
      font-weight: 600;
    }

    .progress {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .progress-count {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--color-primary);
    }

    .progress-count--error {
      color: var(--color-error, #ef4444);
    }

    .progress-percentage {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-success);
    }

    .question-image {
      margin-bottom: 2rem;
      text-align: center;
    }

    .question-image img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .question-image img:hover {
      transform: scale(1.02);
    }

    .question-text {
      margin-bottom: 2rem;
    }

    .question-number {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.75rem;
    }

    .question-text h2 {
      font-size: 1.5rem;
      line-height: 1.5;
      color: var(--color-text);
    }

    .answer-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .answer-options.has-images {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .option-button {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--color-background);
      border: 2px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      font-size: 1rem;
    }

    .option-button.has-image {
      flex-direction: column;
      align-items: stretch;
      padding: 0.75rem;
    }

    .option-button:hover:not(:disabled) {
      border-color: var(--color-primary);
      background: var(--color-surface);
      transform: translateX(4px);
    }

    .option-button.selected {
      border-color: var(--color-primary);
      background: var(--color-surface);
    }

    .option-button.correct {
      border-color: var(--color-success);
      background: rgba(56, 161, 105, 0.1);
    }

    .option-button.incorrect {
      border-color: var(--color-error);
      background: rgba(229, 62, 62, 0.1);
    }

    .option-button:disabled {
      cursor: not-allowed;
    }

    .option-letter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--color-primary);
      color: white;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .option-button.correct .option-letter {
      background: var(--color-success);
    }

    .option-button.incorrect .option-letter {
      background: var(--color-error);
    }

    .option-text {
      flex: 1;
      color: var(--color-text);
    }

    .option-image {
      width: 100%;
      margin-top: 0.5rem;
      border-radius: 6px;
      overflow: hidden;
    }

    .option-image img {
      width: 100%;
      height: auto;
      max-height: 200px;
      object-fit: contain;
      display: block;
    }

    .option-button.has-image .option-letter {
      align-self: flex-start;
    }

    .feedback {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feedback.correct {
      background: rgba(56, 161, 105, 0.1);
      border: 2px solid var(--color-success);
    }

    .feedback.incorrect {
      background: rgba(229, 62, 62, 0.1);
      border: 2px solid var(--color-error);
    }

    .feedback-icon {
      font-size: 2rem;
    }

    .feedback-text {
      flex: 1;
    }

    .feedback-text strong {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 1.125rem;
    }

    .btn-next {
      padding: 0.75rem 1.5rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-next:hover {
      background: var(--color-primary-dark);
    }

    .keyboard-hint {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-top: 1rem;
    }

    .no-question {
      text-align: center;
      padding: 4rem 2rem;
    }

    .no-question h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--color-text);
    }

    .no-question p {
      font-size: 1.25rem;
      color: var(--color-text-secondary);
      margin-bottom: 2rem;
    }

    .btn-primary {
      padding: 1rem 2rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
    }

    @media (max-width: 768px) {
      .quiz-container {
        padding: 1rem;
      }

      .quiz-card {
        padding: 1.5rem;
      }

      .question-text h2 {
        font-size: 1.25rem;
      }

      .option-button {
        padding: 0.75rem;
      }

      .answer-options.has-images {
        grid-template-columns: 1fr;
      }

      .option-image img {
        max-height: 150px;
      }
    }
  `]
})
export class QuizComponent implements OnInit, OnDestroy {
  private quizService = inject(QuizService);
  private imageService = inject(ImageService);
  private router = inject(Router);

  currentQuestion = this.quizService.currentQuestion;
  stats = this.quizService.statistics;
  quizMode = this.quizService.quizMode;

  selectedAnswer = signal<'A' | 'B' | 'C' | 'D' | null>(null);
  showFeedback = signal(false);
  isCorrectAnswer = signal(false);

  ngOnInit(): void {
    if (!this.currentQuestion()) {
      this.selectNext();
    }
  }

  ngOnDestroy(): void {
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.showFeedback()) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.nextQuestion();
      }
      return;
    }

    const key = event.key.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(key)) {
      event.preventDefault();
      this.selectAnswer(key as 'A' | 'B' | 'C' | 'D');
    }
  }

  async selectAnswer(answer: 'A' | 'B' | 'C' | 'D'): Promise<void> {
    if (this.showFeedback()) return;

    this.selectedAnswer.set(answer);
    const isCorrect = await this.quizService.submitAnswer(answer);
    this.isCorrectAnswer.set(isCorrect);
    this.showFeedback.set(true);
  }

  private selectNext(): void {
    if (this.quizMode() === 'incorrect') {
      this.quizService.selectRandomIncorrectQuestion();
    } else {
      this.quizService.selectRandomQuestion();
    }
  }

  nextQuestion(): void {
    this.selectedAnswer.set(null);
    this.showFeedback.set(false);
    this.isCorrectAnswer.set(false);
    this.selectNext();
  }

  isCorrect(): boolean {
    return this.isCorrectAnswer();
  }

  getImageUrl(filename: string): string {
    return this.imageService.getImageUrl(filename);
  }

  openImageModal(filename: string): void {
    window.open(this.getImageUrl(filename), '_blank');
  }

  goHome(): void {
    this.quizService.setMode('all');
    this.router.navigate(['/']);
  }
}
