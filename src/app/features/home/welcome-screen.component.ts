import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService, QuizMode } from '../../core/services/quiz.service';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <div class="welcome-card">
        <h1>Test Českého Občanství</h1>
        <p class="subtitle">Databanka testových úloh z českých reálií</p>

        <div class="stats-preview">
          <div class="stat-item">
            <div class="stat-value">{{ stats().totalQuestions }}</div>
            <div class="stat-label">Celkem otázek</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats().correctAnswers }}</div>
            <div class="stat-label">Zodpovězeno</div>
          </div>
          <div class="stat-item stat-item--error">
            <div class="stat-value stat-value--error">{{ stats().incorrectAnswers }}</div>
            <div class="stat-label">Špatně</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats().successRate.toFixed(0) }}%</div>
            <div class="stat-label">Zodpovězeno v %</div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary" (click)="startQuiz()">
            {{ hasProgress() ? 'Pokračovat v testu' : 'Začít test' }}
          </button>
          @if (stats().incorrectAnswers > 0) {
            <button class="btn btn-error" (click)="practiceIncorrect()">
              Procvičit špatné ({{ stats().incorrectAnswers }})
            </button>
          }
          <button class="btn btn-secondary" (click)="viewStats()">
            Zobrazit statistiky
          </button>
          @if (hasProgress()) {
            <button class="btn btn-outline" (click)="resetQuiz()">
              Resetovat pokrok
            </button>
          }
        </div>

        <div class="info">
          <p>Otestujte své znalosti českých reálií. Otázky jsou rozděleny do kategorií pokrývajících zvyky, historii, geografii a další aspekty České republiky.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
      padding: 2rem;
    }

    .welcome-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-text);
    }

    .subtitle {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
      margin-bottom: 3rem;
    }

    .stats-preview {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-item {
      padding: 1.5rem;
      background: var(--color-surface);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .stat-value--error {
      color: var(--color-error, #ef4444);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background: var(--color-secondary-dark);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--color-border);
      color: var(--color-text);
    }

    .btn-outline:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .btn-error {
      background: var(--color-error, #ef4444);
      color: white;
    }

    .btn-error:hover {
      background: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .info {
      padding: 1.5rem;
      background: var(--color-surface);
      border-radius: 8px;
      border-left: 4px solid var(--color-primary);
    }

    .info p {
      margin: 0;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    @media (max-width: 600px) {
      h1 {
        font-size: 2rem;
      }

      .stats-preview {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    }
  `]
})
export class WelcomeScreenComponent {
  private quizService = inject(QuizService);
  private router = inject(Router);

  stats = this.quizService.statistics;

  hasProgress = computed(() => {
    return this.stats().answeredQuestions > 0;
  });

  startQuiz(): void {
    this.quizService.setMode('all');
    this.quizService.selectRandomQuestion();
    this.router.navigate(['/quiz']);
  }

  practiceIncorrect(): void {
    this.quizService.setMode('incorrect');
    this.quizService.selectRandomIncorrectQuestion();
    this.router.navigate(['/quiz']);
  }

  viewStats(): void {
    this.router.navigate(['/statistics']);
  }

  async resetQuiz(): Promise<void> {
    if (confirm('Opravdu chcete resetovat celý pokrok? Tato akce je nevratná.')) {
      await this.quizService.resetQuiz();
    }
  }
}
