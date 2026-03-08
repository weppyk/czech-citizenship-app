import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { QuizService } from '../../core/services/quiz.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">🇨🇿 Test Občanství</a>
        </div>

        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Domů</a>
          <a routerLink="/quiz" routerLinkActive="active">Kvíz</a>
          <a routerLink="/statistics" routerLinkActive="active">Statistiky</a>
        </nav>

        <div class="actions">
          <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Přepnout na ' + (effectiveTheme() === 'light' ? 'tmavý' : 'světlý') + ' režim'">
            @if (effectiveTheme() === 'light') {
              <span class="icon">🌙</span>
            } @else {
              <span class="icon">☀️</span>
            }
          </button>

          <div class="progress-badge">
            {{ stats().correctAnswers }} / {{ stats().totalQuestions }}
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo a {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--color-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav {
      display: flex;
      gap: 1.5rem;
    }

    .nav a {
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .nav a:hover {
      color: var(--color-primary);
      background: var(--color-background);
    }

    .nav a.active {
      color: var(--color-primary);
      background: var(--color-background);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .theme-toggle:hover {
      background: var(--color-surface);
      border-color: var(--color-primary);
    }

    .icon {
      font-size: 1.2rem;
      display: block;
      width: 24px;
      height: 24px;
      text-align: center;
    }

    .progress-badge {
      background: var(--color-primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0.75rem 1rem;
        flex-wrap: wrap;
      }

      .logo a {
        font-size: 1.2rem;
      }

      .nav {
        gap: 0.5rem;
        order: 3;
        width: 100%;
        justify-content: center;
      }

      .nav a {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private quizService = inject(QuizService);

  effectiveTheme = this.themeService.effectiveTheme;
  stats = this.quizService.statistics;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
