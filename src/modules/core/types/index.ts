export interface AppInfo {
  id: string;
  name: string;
  dbCount: number;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
}
