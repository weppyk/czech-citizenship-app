export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  timerEnabled: boolean;
  timerDuration: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  showHints: boolean;
}

export const defaultSettings: AppSettings = {
  theme: 'system',
  timerEnabled: false,
  timerDuration: 60,
  soundEnabled: false,
  animationsEnabled: true,
  showHints: true,
};
