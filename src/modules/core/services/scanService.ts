import RNFS from 'react-native-fs';
import { AppEntry, DatabaseFile, ScanProgress } from '../types';

/**
 * Device scan & discovery (scope §3.1, ADR-4). Walks configurable roots,
 * identifies SQLite files by magic header, groups them under their owning
 * app package inferred from the path.
 */

const SQLITE_HEADER = 'SQLite format 3';
const DB_EXTENSIONS = ['.db', '.sqlite', '.sqlite3', '.db3'];
const MAX_DEPTH = 7;
const SKIP_DIRS = new Set([
  'node_modules',
  'DCIM', // media only, never app databases
  'cache',
  '.cache',
]);

/** Default roots reachable without root; rooted paths go via settings. */
export const defaultScanRoots = (): string[] => {
  const roots: string[] = [];
  if (RNFS.ExternalStorageDirectoryPath) roots.push(RNFS.ExternalStorageDirectoryPath);
  if (RNFS.ExternalDirectoryPath) roots.push(RNFS.ExternalDirectoryPath);
  return roots;
};

const looksLikeDbFile = (name: string): boolean =>
  DB_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext));

/** Verify magic bytes (first 16) to avoid false positives on .db dumps. */
const isSqliteFile = async (path: string): Promise<boolean> => {
  try {
    const head = await RNFS.read(path, 16, 0, 'ascii');
    return typeof head === 'string' && head.startsWith(SQLITE_HEADER);
  } catch {
    return false;
  }
};

const PACKAGE_RE = /[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+){2,}/;
const SYSTEM_PREFIXES = ['android.', 'com.android.', 'com.google.android.'];

/** Extract the owning package (or folder label) from an absolute path. */
const inferOwner = (
  path: string,
): { id: string; name: string; isSystemApp: boolean } => {
  const match = path.match(PACKAGE_RE);
  if (match) {
    const id = match[0].toLowerCase();
    const name = id.split('.').pop() ?? id;
    const display = name.charAt(0).toUpperCase() + name.slice(1);
    const isSystemApp =
      SYSTEM_PREFIXES.some(p => id.startsWith(p)) || path.startsWith('/system');
    return { id, name: display, isSystemApp };
  }
  // No package-looking segment: attribute to the containing folder.
  const parts = path.split('/').filter(Boolean);
  const owner = parts[parts.length - 2] ?? 'local';
  return { id: `folder:${owner}`, name: owner, isSystemApp: false };
};

interface WalkSink {
  dbPaths: string[];
  onProgress: (p: ScanProgress) => void;
  scanned: number;
}

const walk = async (dir: string, depth: number, sink: WalkSink): Promise<void> => {
  if (depth > MAX_DEPTH) return;
  let entries;
  try {
    entries = await RNFS.readDir(dir);
  } catch {
    return; // unreadable sandbox dirs are normal; skip silently
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(entry.path, depth + 1, sink);
    } else if (entry.isFile() && looksLikeDbFile(entry.name)) {
      sink.scanned += 1;
      if (sink.scanned % 25 === 0) {
        sink.onProgress({
          phase: 'scanning',
          scannedFiles: sink.scanned,
          foundDatabases: sink.dbPaths.length,
          currentPath: entry.path,
        });
      }
      if (await isSqliteFile(entry.path)) {
        sink.dbPaths.push(entry.path);
      }
    }
  }
};

/**
 * Run a full scan. Groups results per app and returns them sorted by
 * database count (desc). Progress is emitted through `onProgress`.
 */
export const scanForDatabases = async (
  extraRoots: string[],
  onProgress: (p: ScanProgress) => void,
): Promise<AppEntry[]> => {
  const roots = [...defaultScanRoots(), ...extraRoots].filter(Boolean);
  const sink: WalkSink = { dbPaths: [], scanned: 0, onProgress };

  onProgress({ phase: 'scanning', scannedFiles: 0, foundDatabases: 0 });
  for (const root of roots) {
    await walk(root, 0, sink);
  }

  const byApp = new Map<string, { name: string; isSystemApp: boolean; dbPaths: string[] }>();
  for (const path of sink.dbPaths) {
    const owner = inferOwner(path);
    const existing = byApp.get(owner.id);
    if (existing) {
      existing.dbPaths.push(path);
    } else {
      byApp.set(owner.id, { name: owner.name, isSystemApp: owner.isSystemApp, dbPaths: [path] });
    }
  }

  const apps: AppEntry[] = Array.from(byApp.entries())
    .map(([id, v]) => ({ id, name: v.name, isSystemApp: v.isSystemApp, dbPaths: v.dbPaths }))
    .sort((a, b) => b.dbPaths.length - a.dbPaths.length);

  onProgress({
    phase: 'done',
    scannedFiles: sink.scanned,
    foundDatabases: sink.dbPaths.length,
    message: `${apps.length} apps, ${sink.dbPaths.length} databases found`,
  });
  return apps;
};

/** Metadata for one discovered database file. */
export const statDatabase = async (path: string): Promise<DatabaseFile> => {
  let sizeBytes = -1;
  try {
    const stat = await RNFS.stat(path);
    sizeBytes = Number(stat.size);
  } catch {
    // size stays unknown
  }
  const file = path.slice(path.lastIndexOf('/') + 1);
  const dot = file.lastIndexOf('.');
  return { path, name: dot > 0 ? file.slice(0, dot) : file, sizeBytes };
};
