// Domain types shared across modules (see project_context.md §4.2 modules/core).

/** An application discovered to own at least one SQLite database. */
export interface AppEntry {
  /** Package name or inferred owner identifier, e.g. "com.example.app". */
  id: string;
  /** Human-friendly display name. */
  name: string;
  /** Absolute paths of the SQLite files attributed to this app. */
  dbPaths: string[];
  /** True when the owning package lives in a system partition. */
  isSystemApp: boolean;
}

/** A SQLite file opened for inspection. */
export interface DatabaseFile {
  /** Absolute filesystem path. */
  path: string;
  /** Display name (file name without extension). */
  name: string;
  /** Size in bytes; -1 when unknown. */
  sizeBytes: number;
}

export interface ColumnInfo {
  name: string;
  /** Declared SQLite type, e.g. TEXT / INTEGER. */
  type: string;
  notNull: boolean;
  primaryKey: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  /** Row count; populated lazily when a table is opened. */
  rowCount?: number;
}

/** Identifies the exact table being viewed/edited. */
export interface TableRef {
  dbPath: string;
  table: string;
}

export type CellValue = string | number | boolean | null | Uint8Array;

export interface QueryResult {
  /** Column names in select order; empty for non-SELECT statements. */
  columns: string[];
  rows: Record<string, CellValue>[];
  rowsAffected: number;
  executionMs: number;
}

export interface PaginatedRows extends QueryResult {
  page: number;
  pageSize: number;
  totalRows: number;
  hasMore: boolean;
}

export type ExportFormat = 'json' | 'csv' | 'tsv';

export type ThemeMode = 'light' | 'dark' | 'system';

/** A persisted entry in Query Master history. */
export interface QueryHistoryItem {
  id: string;
  sql: string;
  dbPath: string;
  runAt: number;
  ok: boolean;
}

/** Progress reported by the device scanner. */
export interface ScanProgress {
  phase: 'idle' | 'permissions' | 'scanning' | 'reading' | 'done' | 'error';
  scannedFiles: number;
  foundDatabases: number;
  currentPath?: string;
  message?: string;
}

/** Filter/search clause applied to a table data view. */
export interface RowFilter {
  column?: string;
  term: string;
}

/** Navigation param bundles (single source of truth for route typing). */
export type RootStackParamList = {
  AppsList: undefined;
  DBTree: { appId: string };
  TableData: { dbPath: string; table: string };
};
