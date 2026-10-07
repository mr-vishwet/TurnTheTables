import { open, DB } from '@op-engineering/op-sqlite';
import RNFS from 'react-native-fs';
import { ColumnInfo, PaginatedRows, QueryResult, TableInfo, CellValue } from '../types';

/**
 * SQLite access layer (ADR-2). All DBs are opened by absolute file path via
 * op-sqlite's { name, location } split. Open handles are cached per path.
 */

const handleCache = new Map<string, DB>();

const splitPath = (dbPath: string): { dir: string; name: string } => {
  const idx = dbPath.lastIndexOf('/');
  return { dir: dbPath.slice(0, idx) || '/', name: dbPath.slice(idx + 1) };
};

export const openDatabase = (dbPath: string, readOnly = false): DB => {
  const key = `${dbPath}:${readOnly ? 'ro' : 'rw'}`;
  const cached = handleCache.get(key);
  if (cached) return cached;
  const { dir, name } = splitPath(dbPath);
  const db = open({ name, location: dir, readOnly });
  handleCache.set(key, db);
  return db;
};

export const closeDatabase = (dbPath: string) => {
  for (const key of Array.from(handleCache.keys())) {
    if (key.startsWith(`${dbPath}:`)) {
      try {
        handleCache.get(key)?.close();
      } catch {
        // closing an already-destroyed handle is harmless
      }
      handleCache.delete(key);
    }
  }
};

const toQueryResult = (
  res: Awaited<ReturnType<DB['execute']>>,
  startedAt: number,
): QueryResult => {
  const rows = res.rows ?? [];
  const columns =
    res.columnNames ?? (rows.length > 0 ? Object.keys(rows[0] as object) : []);
  return {
    columns,
    rows: rows as Record<string, CellValue>[],
    rowsAffected: res.rowsAffected ?? 0,
    executionMs: Date.now() - startedAt,
  };
};

/** Run arbitrary SQL against a DB file. */
export const executeQuery = async (
  dbPath: string,
  sql: string,
  params: unknown[] = [],
): Promise<QueryResult> => {
  const db = openDatabase(dbPath);
  const startedAt = Date.now();
  const res = await db.execute(sql, params as never);
  return toQueryResult(res, startedAt);
};

/** All user tables in a database (sqlite internal tables excluded). */
export const listTables = async (dbPath: string): Promise<TableInfo[]> => {
  const result = await executeQuery(
    dbPath,
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  const tables = result.rows.map(r => String(r.name));
  const infos = await Promise.all(
    tables.map(async name => ({ name, columns: await listColumns(dbPath, name) })),
  );
  return infos;
};

export const listColumns = async (dbPath: string, table: string): Promise<ColumnInfo[]> => {
  const res = await executeQuery(dbPath, `PRAGMA table_info("${table.replace(/"/g, '""')}")`);
  return res.rows.map(r => ({
    name: String(r.name),
    type: String(r.type ?? ''),
    notNull: Number(r.notnull ?? 0) === 1,
    primaryKey: Number(r.pk ?? 0) === 1,
  }));
};

export const countRows = async (dbPath: string, table: string): Promise<number> => {
  const res = await executeQuery(dbPath, `SELECT COUNT(*) AS c FROM "${table.replace(/"/g, '""')}"`);
  return Number(res.rows[0]?.c ?? 0);
};

const quoteId = (id: string) => `"${id.replace(/"/g, '""')}"`;

/**
 * Paginated, optionally filtered table read. `rowid` is surfaced as `_rid`
 * so the UI can target rows for edit/delete regardless of PK layout.
 */
export const fetchRowPage = async (
  dbPath: string,
  table: string,
  page: number,
  pageSize: number,
  search?: { term: string; columns: string[] },
): Promise<PaginatedRows> => {
  const safeTable = quoteId(table);
  let where = '';
  const params: unknown[] = [];
  if (search && search.term.trim()) {
    const clauses = search.columns.map(c => `CAST(${quoteId(c)} AS TEXT) LIKE ?`);
    where = `WHERE ${clauses.join(' OR ')}`;
    const like = `%${search.term.trim()}%`;
    params.push(...search.columns.map(() => like));
  }
  const totalResult = await executeQuery(
    dbPath,
    `SELECT COUNT(*) AS c FROM ${safeTable} ${where}`,
    params,
  );
  const totalRows = Number(totalResult.rows[0]?.c ?? 0);

  const res = await executeQuery(
    dbPath,
    `SELECT rowid AS _rid, * FROM ${safeTable} ${where} LIMIT ? OFFSET ?`,
    [...params, pageSize, page * pageSize],
  );
  return {
    ...res,
    page,
    pageSize,
    totalRows,
    hasMore: (page + 1) * pageSize < totalRows,
  };
};

/** Long-press → edit cell. Writes by rowid. */
export const updateCell = (
  dbPath: string,
  table: string,
  rowId: number,
  column: string,
  value: CellValue,
): Promise<QueryResult> =>
  executeQuery(
    dbPath,
    `UPDATE ${quoteId(table)} SET ${quoteId(column)} = ? WHERE rowid = ?`,
    [value as never, rowId],
  );

export const deleteRow = (dbPath: string, table: string, rowId: number): Promise<QueryResult> =>
  executeQuery(dbPath, `DELETE FROM ${quoteId(table)} WHERE rowid = ?`, [rowId]);

export const dropTable = (dbPath: string, table: string): Promise<QueryResult> =>
  executeQuery(dbPath, `DROP TABLE IF EXISTS ${quoteId(table)}`);

/** Create a table from a basic column definition list (scope §3.4). */
export const createTable = (
  dbPath: string,
  name: string,
  columns: { name: string; type: string; primaryKey?: boolean }[],
): Promise<QueryResult> => {
  const defs = columns
    .map(
      c =>
        `${quoteId(c.name)} ${c.type || 'TEXT'}${c.primaryKey ? ' PRIMARY KEY AUTOINCREMENT' : ''}`,
    )
    .join(', ');
  return executeQuery(dbPath, `CREATE TABLE IF NOT EXISTS ${quoteId(name)} (${defs})`);
};

/** Delete a database file (plus WAL/SHM siblings) from disk. */
export const deleteDatabase = async (dbPath: string): Promise<void> => {
  closeDatabase(dbPath);
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    const p = dbPath + suffix;
    if (await RNFS.exists(p)) {
      await RNFS.unlink(p);
    }
  }
};

/** Prebuilt queries for Query Master (scope §3.5). */
export const PREBUILT_QUERIES: { label: string; sql: string }[] = [
  { label: 'Show all tables', sql: "SELECT name AS table_name FROM sqlite_master WHERE type='table'" },
  { label: 'List indexes', sql: "SELECT name AS index_name, tbl_name FROM sqlite_master WHERE type='index'" },
  { label: 'DB page size', sql: 'PRAGMA page_size' },
  { label: 'Foreign key state', sql: 'PRAGMA foreign_keys' },
];
