# Roadmap — Turn the Tables

Scope source: `project_context.md` §3 (Core Features). Goal: take the scaffolded
codebase to a fully wired, functional app.

## Phase 0 — Foundation ✅ (2025-12-19)
- React Native 0.83 project created; feature-sliced `src/modules/` layout.
- Navigation shells (bottom tabs + per-feature stacks), stub screens, theme seed.

## Phase 1 — Core Infrastructure ✅ (2026-10-07)
- [x] Dependency layer (all open source): `@op-engineering/op-sqlite`, `react-native-fs`,
      `react-native-permissions`, `react-native-share`, `async-storage`, `zustand`.
- [x] Full domain types (`AppEntry`, `DatabaseFile`, `TableSchema`, `QueryResult`…).
- [x] Real services: DB scanner, SQLite access, permissions, file export (JSON/CSV/TSV).
- [x] Settings store with persistence (system apps toggle, export format, theme).
- [x] Design tokens for light/dark themes + common component kit.

## Phase 2 — Browse Flow ✅ (2026-10-07)
- [x] ScanScreen: permission request → real filesystem scan → progress.
- [x] AppsListScreen: real scan results, db counts, system-app filtering.
- [x] DBTreeScreen: App → Databases → Tables → Columns from live schemas.
- [x] TableDataScreen: paginated rows, search, long-press cell actions
      (copy/edit), delete row/table/database with confirmation, export.

## Phase 3 — Query Master ✅ (2026-10-07)
- [x] Direct SQL mode against a chosen database.
- [x] Prebuilt queries (tables, row counts, indexes).
- [x] Query history (persisted, re-run + edit).
- [x] Result grid + CSV/JSON export.
- [ ] Natural-language mode (planned; out of current scope).

## Phase 4 — Settings & Polish ✅ (2026-10-07)
- [x] Show System Apps toggle (respected in scan results).
- [x] Default export format preference.
- [x] Light/Dark theme switch.
- [x] About/Help section with capability + safety notes.

## Phase 5 — Release Prep (next)
- [ ] On-device smoke test on rooted Android (real DB access requires root).
- [ ] Android debug build → release signing config.
- [ ] Delete legacy `master` branch; set `main` as repo default (GitHub setting).
- [ ] Performance pass on large tables (virtualized grid).
