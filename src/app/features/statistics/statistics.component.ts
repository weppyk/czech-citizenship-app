import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="statistics-container">
      <div class="stats-header">
        <h1>Statistiky</h1>
        <div class="export-buttons">
          <button class="btn-export" (click)="exportPDF()" [disabled]="exporting()">
            {{ exporting() ? 'Exportuji...' : '📄 Export PDF' }}
          </button>
          <button class="btn-export" (click)="exportCSV()" [disabled]="exporting()">
            {{ exporting() ? 'Exportuji...' : '📊 Export CSV' }}
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-value">{{ stats().totalQuestions }}</div>
          <div class="stat-label">Celkem otázek</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ stats().correctAnswers }}</div>
          <div class="stat-label">Správně</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-value">{{ stats().incorrectAnswers }}</div>
          <div class="stat-label">Špatně</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value">{{ stats().successRate.toFixed(1) }}%</div>
          <div class="stat-label">Úspěšnost</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatTime(stats().totalTimeSpent) }}</div>
          <div class="stat-label">Celkový čas</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⌛</div>
          <div class="stat-value">{{ stats().averageTimePerQuestion.toFixed(1) }}s</div>
          <div class="stat-label">Průměrný čas</div>
        </div>
      </div>

      <div class="sections-breakdown">
        <h2>Statistiky po sekcích</h2>
        <div class="sections-list">
          @for (section of stats().sectionStats; track section.sectionNumber) {
            <div class="section-card">
              <div class="section-header">
                <div class="section-title">
                  <span class="section-number">{{ section.sectionNumber }}.</span>
                  <span class="section-name">{{ section.sectionName }}</span>
                </div>
                <div class="section-progress">
                  {{ section.answeredQuestions }} / {{ section.totalQuestions }}
                </div>
              </div>

              <div class="progress-bar">
                <div
                  class="progress-fill correct"
                  [style.width.%]="(section.correctAnswers / section.totalQuestions) * 100"
                ></div>
                <div
                  class="progress-fill incorrect"
                  [style.width.%]="(section.incorrectAnswers / section.totalQuestions) * 100"
                ></div>
              </div>

              <div class="section-stats">
                <div class="section-stat success">
                  <span class="label">Správně:</span>
                  <span class="value">{{ section.correctAnswers }}</span>
                </div>
                <div class="section-stat error">
                  <span class="label">Špatně:</span>
                  <span class="value">{{ section.incorrectAnswers }}</span>
                </div>
                <div class="section-stat">
                  <span class="label">Úspěšnost:</span>
                  <span class="value">{{ section.successRate.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" (click)="continueQuiz()">
          Pokračovat v testu
        </button>
        <button class="btn-secondary" (click)="goHome()">
          Zpět na úvodní stránku
        </button>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .stats-header h1 {
      font-size: 2rem;
      color: var(--color-text);
    }

    .export-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-export {
      padding: 0.75rem 1.5rem;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      color: var(--color-text);
    }

    .btn-export:hover:not(:disabled) {
      border-color: var(--color-primary);
      background: var(--color-background);
    }

    .btn-export:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: var(--color-surface);
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
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

    .sections-breakdown {
      background: var(--color-surface);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .sections-breakdown h2 {
      margin-bottom: 1.5rem;
      color: var(--color-text);
    }

    .sections-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-card {
      background: var(--color-background);
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid var(--color-primary);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-number {
      font-weight: bold;
      color: var(--color-primary);
    }

    .section-name {
      font-weight: 600;
      color: var(--color-text);
    }

    .section-progress {
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .progress-bar {
      height: 8px;
      background: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
      display: flex;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-fill.correct {
      background: var(--color-success);
    }

    .progress-fill.incorrect {
      background: var(--color-error);
    }

    .section-stats {
      display: flex;
      gap: 2rem;
      font-size: 0.9rem;
    }

    .section-stat {
      display: flex;
      gap: 0.5rem;
    }

    .section-stat .label {
      color: var(--color-text-secondary);
    }

    .section-stat .value {
      font-weight: 600;
      color: var(--color-text);
    }

    .section-stat.success .value {
      color: var(--color-success);
    }

    .section-stat.error .value {
      color: var(--color-error);
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary,
    .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background: var(--color-secondary-dark);
    }

    @media (max-width: 768px) {
      .statistics-container {
        padding: 1rem;
      }

      .stats-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .export-buttons {
        width: 100%;
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .section-stats {
        flex-direction: column;
        gap: 0.5rem;
      }

      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  private quizService = inject(QuizService);
  private exportService = inject(ExportService);
  private router = inject(Router);

  stats = this.quizService.statistics;
  exporting = signal(false);

  ngOnInit(): void {
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  async exportPDF(): Promise<void> {
    this.exporting.set(true);
    try {
      const stats = this.stats();
      const answeredQuestions = this.quizService.quizState().answeredQuestions;
      this.exportService.exportToPDF(stats, answeredQuestions);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Nepodařilo se exportovat PDF. Zkuste to prosím znovu.');
    } finally {
      setTimeout(() => this.exporting.set(false), 1000);
    }
  }

  async exportCSV(): Promise<void> {
    this.exporting.set(true);
    try {
      const answeredQuestions = this.quizService.quizState().answeredQuestions;
      if (answeredQuestions.length === 0) {
        alert('Nejsou k dispozici žádná data k exportu.');
        return;
      }
      this.exportService.exportToCSV(answeredQuestions);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Nepodařilo se exportovat CSV. Zkuste to prosím znovu.');
    } finally {
      setTimeout(() => this.exporting.set(false), 1000);
    }
  }

  continueQuiz(): void {
    this.quizService.selectRandomQuestion();
    this.router.navigate(['/quiz']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
