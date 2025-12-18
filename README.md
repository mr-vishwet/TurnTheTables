# README.md

## Turn the Tables

Turn the Tables is a React Native app that lets you discover and inspect local SQLite databases created by installed apps on your device. It’s built for developers and power users who want desktop-style DB introspection directly on mobile.

### Core Features

- Scan device storage for app-specific SQLite databases.
- View a hierarchy of **App → Databases → Tables → Columns**.
- Inspect table data in a tabular, paginated view.
- Run queries via a **Query Master**:
  - Direct SQL.
  - Natural language (planned).
- Edit and manage data:
  - Edit/copy cell values.
  - Delete rows, tables, or databases (with confirmation).
  - Create new tables.
- Export table/query results as **JSON** or **CSV/TSV**.
- Configure behavior:
  - Toggle **Show System Apps**.
  - Set default export format.
  - Theme switch (planned).

### Architecture (High-Level)

- React Native + TypeScript.
- Feature-based modules:
  - `scan`, `apps`, `dbBrowser`, `query`, `settings`.
- Shared core layer for:
  - SQLite access, file export, permissions, shared types.
- Navigation:
  - Bottom tab bar: **Home**, **Query**, **Settings**.
  - Stack navigation per tab for detailed flows.

### Getting Started

1. Install dependencies:

npm install

text

2. Run on Android:

npx react-native run-android

text

3. Run on iOS (from macOS):

npx react-native run-ios

text

### Project Docs

- Detailed context and decisions: `Project_Context.md`
- Architecture and scaffolding notes: `project_init.md`

