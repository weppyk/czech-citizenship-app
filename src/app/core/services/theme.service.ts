import { Injectable, signal, effect } from '@angular/core';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<Theme>('system');
  private effectiveThemeSignal = signal<'light' | 'dark'>('light');

  theme = this.themeSignal.asReadonly();
  effectiveTheme = this.effectiveThemeSignal.asReadonly();

  constructor(private storageService: StorageService) {
    this.loadTheme();
    this.applyTheme();

    effect(() => {
      const theme = this.theme();
      this.updateEffectiveTheme();
      this.saveTheme(theme);
    });

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.updateEffectiveTheme();
        }
      });
    }
  }

  private async loadTheme(): Promise<void> {
    try {
      const settings = await this.storageService.getSettings();
      this.themeSignal.set(settings.theme);
      this.updateEffectiveTheme();
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  private async saveTheme(theme: Theme): Promise<void> {
    try {
      const settings = await this.storageService.getSettings();
      await this.storageService.saveSettings({ ...settings, theme });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.updateEffectiveTheme();
  }

  toggleTheme(): void {
    const currentEffective = this.effectiveTheme();
    const newTheme = currentEffective === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
    this.updateEffectiveTheme();
  }

  private updateEffectiveTheme(): void {
    let effective: 'light' | 'dark' = 'light';
    const theme = this.theme();

    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        effective = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
    } else {
      effective = theme;
    }

    this.effectiveThemeSignal.set(effective);
    this.applyThemeToDocument(effective);
  }

  private applyTheme(): void {
    const effective = this.effectiveTheme();
    this.applyThemeToDocument(effective);
  }

  private applyThemeToDocument(theme: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
