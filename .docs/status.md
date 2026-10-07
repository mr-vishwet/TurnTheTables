# Status — Turn the Tables
_Last updated: 2026-10-07 (scope-completion session)_

Feature-by-feature completion against `project_context.md` §3.

| Scope item | Status | Where |
|---|---|---|
| §3.1 Device scan & discovery (progress, permissions, system-app preference) | ✅ Implemented | `scanService`, `permissionsService`, `ScanScreen` |
| §3.2 Apps list (name, DB count, drill-down, system-app filter) | ✅ Implemented | `AppsListScreen` |
| §3.3 DB & tables tree (App → DB → Tables → Columns, tap-through) | ✅ Implemented | `DBTreeScreen` + `sqliteService.listTables/listColumns` |
| §3.4 Table data view (pagination, search/filter, long-press copy/edit, delete row/table/DB, create table, JSON/CSV/TSV export) | ✅ Implemented | `TableDataScreen`, `fileExportService` |
| §3.5 Query Master — direct SQL, prebuilt queries, history (re-run/edit), result grid, exports | ✅ Implemented | `QueryScreen` |
| §3.5 Query Master — natural-language mode | ⏭ Deferred (ADR-6) | roadmap Phase 3 open item |
| §3.6 Settings (system apps toggle, default export format, about/help) | ✅ Implemented | `SettingsScreen` |
| §3.6 Theme switch light/dark | ✅ Implemented (also 'system' follow-OS) | `theme/index.ts`, `useTheme`, store |
| §3.7 UX details (confirmations, pagination, banners, empty states) | ✅ Implemented | `components/common` |
| §4 Architecture (feature modules + core services/types/hooks) | ✅ Extended as designed | `src/modules/*` |
| §7 Non-functional (error handling, parameterized SQL, confirm-before-destroy) | ✅ Implemented | services + screens |

## Build/validation state
- `tsc --noEmit`: **0 errors**
- `eslint src`: **0 errors**, 25 warnings (dynamic theme inline styles — expected)
- AndroidManifest: storage permissions + `requestLegacyExternalStorage` added
- Native build/device run: **not yet executed** (needs Android toolchain / device)

## Known constraints
- Non-rooted devices: scan sees shared/external + app-scoped dirs only; `/data/data`
  roots require root (configurable under Settings → Advanced).
- Android 13+ "All files access" must be granted manually in system settings.
- `react-native-fs` is in maintenance upstream; fine for current scope, revisit if it breaks on a future RN.

## Next up (Phase 5)
1. `npm run android` on emulator/rooted device — smoke-test scan → browse → edit → export.
2. GitHub: default branch → `main`, delete `master`.
3. NL→SQL design decision; virtualized grid for very large tables.
