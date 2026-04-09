import { create } from 'zustand';


export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
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
  runInBackground: boolean;
  timerStartAt: number;
  timerPausedAt: number | null;
  defaultFocusDuration: number;
  isTimerConfigured: boolean;
  dailyStreaks: Record<string, number>;
}

export interface FocusSession {
  endTime: string | null; // ISO string when the timer ends
  isActive: boolean;
}

interface AppState {
  timeBlocks: TimeBlock[];
  focusSession: FocusSession;
  settings: Settings;
  addTimeBlock: (block: Omit<TimeBlock, 'id' | 'status'>) => void;
  addTask: (title: string) => void;
  updateBlockStatus: (id: string, status: TimeBlock['status']) => void;
  startFocusSession: (durationMinutes?: number) => Promise<void>;
  stopFocusSession: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
  purgeArchivedTasks: () => void;
}

export const useStore = create<AppState>()((set, get) => ({
  timeBlocks: [
    {
      id: '1',
      title: '5 min meditation',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
      status: 'PENDING',
    },
    {
      id: '2',
      title: 'Deep Work: UI Refinement',
      startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
      status: 'DONE',
    },
  ],
  focusSession: {
    endTime: null,
    isActive: false,
  },
  settings: {
    countdownDays: 30,
    countdownHours: 0,
    countdownMinutes: 0,
    productivityScore: 0,
    lastScoreReset: new Date().toISOString().split('T')[0],
    runInBackground: false,
    timerStartAt: Date.now(),
    timerPausedAt: null,
    defaultFocusDuration: 25,
    isTimerConfigured: false,
    dailyStreaks: {},
  },
  addTimeBlock: (block) => set((state) => ({
    timeBlocks: [
      ...state.timeBlocks,
      { ...block, id: Math.random().toString(36).substring(7), status: 'PENDING' }
    ]
  })),
  addTask: (title) => set((state) => {
    const now = new Date();
    const end = new Date(now.getTime() + state.settings.defaultFocusDuration * 60000);
    return {
      timeBlocks: [
        ...state.timeBlocks,
        {
          id: Math.random().toString(36).substring(7),
          title,
          status: 'PENDING',
          startTime: now.toISOString(),
          endTime: end.toISOString()
        }
      ]
    };
  }),
  updateBlockStatus: (id, status) => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    let newSettings = { ...state.settings };
    
    // Check if daily reset is needed
    if (newSettings.lastScoreReset !== today) {
      newSettings.productivityScore = 0;
      newSettings.lastScoreReset = today;
    }

    const newTimeBlocks = state.timeBlocks.map(b => {
      if (b.id === id) {
        if (status === 'DONE' && b.status !== 'DONE') {
           newSettings.productivityScore = Math.min(100, newSettings.productivityScore + 10);
        } else if (b.status === 'DONE' && status !== 'DONE') {
           newSettings.productivityScore = Math.max(0, newSettings.productivityScore - 10);
        }
        return { 
          ...b, 
          status, 
          archivedAt: status === 'DONE' ? Date.now() : undefined 
        };
      }
      return b;
    });

    newSettings.dailyStreaks = {
      ...(newSettings.dailyStreaks || {}),
      [today]: newSettings.productivityScore
    };

    return {
      timeBlocks: newTimeBlocks,
      settings: newSettings
    };
  }),
  startFocusSession: async (durationMinutes) => {
    const duration = durationMinutes ?? get().settings.defaultFocusDuration;
    const endTime = new Date(Date.now() + duration * 60000);
    
    set({
      focusSession: {
        endTime: endTime.toISOString(),
        isActive: true,
      }
    });
  },
  stopFocusSession: async () => {
    set({
       focusSession: { endTime: null, isActive: false }
    });
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  purgeArchivedTasks: () => set((state) => {
    const fiveMinsAgo = Date.now() - (5 * 60 * 1000);
    return {
      timeBlocks: state.timeBlocks.filter(b => 
        b.status !== 'DONE' || !b.archivedAt || b.archivedAt > fiveMinsAgo
      )
    };
  })
}));
