import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppEntry, ExportFormat, QueryHistoryItem, ThemeMode } from '../types';

/**
 * Global app state (ADR-3). Persisted slice: user settings + query history.
 * Transient slice: latest scan results (re-derivable, so not persisted).
 */
interface AppState {
  // --- persisted settings ---
  showSystemApps: boolean;
  defaultExportFormat: ExportFormat;
  themeMode: ThemeMode;
  /** Extra filesystem roots for rooted devices (ADR-4), absolute paths. */
  additionalScanRoots: string[];

  // --- persisted query history (capped) ---
  queryHistory: QueryHistoryItem[];

  // --- transient scan results ---
  apps: AppEntry[];
  lastScanAt: number | null;

  // --- actions ---
  setShowSystemApps: (v: boolean) => void;
  setDefaultExportFormat: (f: ExportFormat) => void;
  setThemeMode: (m: ThemeMode) => void;
  setAdditionalScanRoots: (roots: string[]) => void;
  setScanResults: (apps: AppEntry[]) => void;
  addHistoryItem: (item: QueryHistoryItem) => void;
  clearHistory: () => void;
}

const HISTORY_LIMIT = 50;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      showSystemApps: false,
      defaultExportFormat: 'json',
      themeMode: 'system',
      additionalScanRoots: [],
      queryHistory: [],
      apps: [],
      lastScanAt: null,

      setShowSystemApps: v => set({ showSystemApps: v }),
      setDefaultExportFormat: f => set({ defaultExportFormat: f }),
      setThemeMode: m => set({ themeMode: m }),
      setAdditionalScanRoots: roots => set({ additionalScanRoots: roots }),
      setScanResults: apps => set({ apps, lastScanAt: Date.now() }),
      addHistoryItem: item =>
        set({ queryHistory: [item, ...get().queryHistory].slice(0, HISTORY_LIMIT) }),
      clearHistory: () => set({ queryHistory: [] }),
    }),
    {
      name: 'turn-the-tables-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        showSystemApps: state.showSystemApps,
        defaultExportFormat: state.defaultExportFormat,
        themeMode: state.themeMode,
        additionalScanRoots: state.additionalScanRoots,
        queryHistory: state.queryHistory,
      }),
    },
  ),
);

/** Convenience selector: every database file discovered across all apps. */
export const selectAllDbPaths = (state: AppState): string[] =>
  state.apps.flatMap(app => app.dbPaths);
