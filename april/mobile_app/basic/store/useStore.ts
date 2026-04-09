import { create } from 'zustand';
import { storage } from './storage';

export interface TimeBlock {
  id: string;
  title: string;
  startTime?: string; // ISO string, optional — user may not set time
  endTime?: string;   // ISO string, optional
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  linkUrl?: string;
  isPdf?: boolean;
  archivedAt?: number;
}

export interface Settings {
  countdownDays: number;
  countdownHours: number;
  countdownMinutes: number;
  productivityScore: number;
  lastScoreReset: string;
  timerStartAt: number;
  timerPausedAt: number | null;
  isTimerConfigured: boolean;
  dailyStreaks: Record<string, number>;
}

// ── storage keys ──────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  timeBlocks: 'chronos:time-blocks',
  settings: 'chronos:settings',
} as const;

// ── defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: Settings = {
  countdownDays: 30,
  countdownHours: 0,
  countdownMinutes: 0,
  productivityScore: 0,
  lastScoreReset: new Date().toISOString().split('T')[0],
  timerStartAt: Date.now(),
  timerPausedAt: null,
  isTimerConfigured: false,
  dailyStreaks: {},
};

const DEFAULT_TIME_BLOCKS: TimeBlock[] = [];

// ── helpers ───────────────────────────────────────────────────────────────────
function loadSettings(): Settings {
  return storage.get<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

function loadTimeBlocks(): TimeBlock[] {
  return storage.get<TimeBlock[]>(STORAGE_KEYS.timeBlocks, DEFAULT_TIME_BLOCKS);
}

// ── store ─────────────────────────────────────────────────────────────────────
interface AppState {
  timeBlocks: TimeBlock[];
  settings: Settings;

  addTask: (title: string, startTime?: string, endTime?: string) => void;
  updateBlockStatus: (id: string, status: TimeBlock['status']) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  purgeArchivedTasks: () => void;
}

export const useStore = create<AppState>()((set, get) => ({
  timeBlocks: loadTimeBlocks(),
  settings: loadSettings(),

  addTask: (title, startTime?, endTime?) =>
    set((state) => {
      const block: TimeBlock = {
        id: Math.random().toString(36).substring(7),
        title,
        status: 'PENDING' as const,
      };
      if (startTime) block.startTime = startTime;
      if (endTime) block.endTime = endTime;
      const next = [...state.timeBlocks, block];
      storage.set(STORAGE_KEYS.timeBlocks, next);
      return { timeBlocks: next };
    }),

  updateBlockStatus: (id, status) =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      let newSettings = { ...state.settings };

      if (newSettings.lastScoreReset !== today) {
        newSettings.productivityScore = 0;
        newSettings.lastScoreReset = today;
      }

      const newTimeBlocks = state.timeBlocks.map((b) => {
        if (b.id === id) {
          if (status === 'DONE' && b.status !== 'DONE') {
            newSettings.productivityScore = Math.min(100, newSettings.productivityScore + 10);
          } else if (b.status === 'DONE' && status !== 'DONE') {
            newSettings.productivityScore = Math.max(0, newSettings.productivityScore - 10);
          }
          return { ...b, status, archivedAt: status === 'DONE' ? Date.now() : undefined };
        }
        return b;
      });

      newSettings.dailyStreaks = {
        ...(newSettings.dailyStreaks || {}),
        [today]: newSettings.productivityScore,
      };

      storage.set(STORAGE_KEYS.timeBlocks, newTimeBlocks);
      storage.set(STORAGE_KEYS.settings, newSettings);

      return { timeBlocks: newTimeBlocks, settings: newSettings };
    }),

  updateSettings: (newSettings) =>
    set((state) => {
      const merged = { ...state.settings, ...newSettings };
      storage.set(STORAGE_KEYS.settings, merged);
      return { settings: merged };
    }),

  purgeArchivedTasks: () =>
    set((state) => {
      const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
      const next = state.timeBlocks.filter(
        (b) => b.status !== 'DONE' || !b.archivedAt || b.archivedAt > fiveMinsAgo
      );
      storage.set(STORAGE_KEYS.timeBlocks, next);
      return { timeBlocks: next };
    }),
}));
