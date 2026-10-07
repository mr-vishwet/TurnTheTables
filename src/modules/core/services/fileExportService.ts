import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { CellValue, ExportFormat, QueryResult } from '../types';

/**
 * Export pipeline (scope §3.4/§3.5, ADR-5): serialize rows to JSON/CSV/TSV,
 * write to the cache directory, then hand the file to the system share sheet.
 */

const MIME: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
};

const EXTENSION: Record<ExportFormat, string> = { json: 'json', csv: 'csv', tsv: 'tsv' };

const cellToString = (v: CellValue): string => {
  if (v === null || v === undefined) return '';
  if (v instanceof Uint8Array) return `<blob:${v.length}B>`;
  return String(v);
};

const escapeDelimited = (value: string, delimiter: string): string => {
  if (value.includes(delimiter) || value.includes('"') || /[\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const toJSONString = (result: Pick<QueryResult, 'rows'>): string =>
  JSON.stringify(result.rows, null, 2);

export const toDelimitedString = (
  result: Pick<QueryResult, 'columns' | 'rows'>,
  delimiter: ',' | '\t',
): string => {
  const header = result.columns.map(c => escapeDelimited(c, delimiter)).join(delimiter);
  const lines = result.rows.map(row =>
    result.columns.map(c => escapeDelimited(cellToString(row[c]), delimiter)).join(delimiter),
  );
  return [header, ...lines].join('\n');
};

export const serialize = (result: QueryResult, format: ExportFormat): string => {
  switch (format) {
    case 'json':
      return toJSONString(result);
    case 'csv':
      return toDelimitedString(result, ',');
    case 'tsv':
      return toDelimitedString(result, '\t');
  }
};

/** Write + share. Returns the absolute path of the generated file. */
export const exportAndShare = async (
  result: QueryResult,
  format: ExportFormat,
  baseName: string,
): Promise<string> => {
  const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${RNFS.CachesDirectoryPath}/${safeName}.${EXTENSION[format]}`;
  await RNFS.writeFile(filePath, serialize(result, format), 'utf8');
  await Share.open({
    title: `Export ${safeName}`,
    url: `file://${filePath}`,
    type: MIME[format],
  });
  return filePath;
};

/** Default format from settings applied to a bare rows payload. */
export const exportRows = (rows: Record<string, CellValue>[], format: ExportFormat, baseName: string) =>
  exportAndShare({ columns: Object.keys(rows[0] ?? {}), rows, rowsAffected: 0, executionMs: 0 }, format, baseName);
