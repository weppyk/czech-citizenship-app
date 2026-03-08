import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './features/home/welcome-screen.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeScreenComponent,
  },
  {
    path: 'quiz',
    loadComponent: () => import('./features/quiz/quiz.component').then(m => m.QuizComponent),
  },
  {
    path: 'statistics',
    loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
