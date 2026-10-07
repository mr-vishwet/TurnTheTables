# Architecture Decision Records — Turn the Tables

Append-only. Format: ADR-n | date | status | decision | rationale.

---

## ADR-1 | 2026-10-07 | Accepted | `main` is the head branch
**Decision:** All development continues on `main`; legacy `master` (scaffold-only)
will be deleted and `main` set as the GitHub default once comfortable.
**Rationale:** `main` holds the real application (72 files); `master` holds only
`scaffold.py`. Keeping `master` as default misrepresents the repo.

## ADR-2 | 2026-10-07 | Accepted | SQLite engine: `@op-engineering/op-sqlite`
**Decision:** Use op-sqlite (MIT, used by Signal) instead of sqlite-storage alternatives.
**Rationale:** Opens databases by **absolute file path** (required to inspect other
apps' DB files), JSI-backed performance, actively maintained, fully open source.

## ADR-3 | 2026-10-07 | Accepted | State management: zustand + AsyncStorage persistence
**Decision:** zustand store for settings/scan results/query history; persist via
`@react-native-async-storage/async-storage` middleware.
**Rationale:** Context scope §8 asked to "finalize state management choice". zustand
is minimal, MIT, no boilerplate, and its persist middleware covers our small
key-value needs without pulling in a DB.

## ADR-4 | 2026-10-07 | Accepted | DB discovery rooted in filesystem scanning
**Decision:** Scan configurable roots (external storage by default; `/data/data`
etc. when device is rooted), detect SQLite files by extension + magic header,
group by owning app package inferred from path.
**Rationale:** Android sandboxes app data; a non-root inspect tool can only reach
shared/external storage. Making roots configurable serves the developer audience
without pretending root access exists everywhere.

## ADR-5 | 2026-10-07 | Accepted | Export via RNFS write + system share sheet
**Decision:** Exports build JSON/CSV/TSV strings, write to cache dir via react-native-fs,
then hand off with react-native-share.
**Rationale:** Avoids storage-permission complexity for output files; share sheet is
the standard "get it off the device" primitive and is open source.

## ADR-6 | 2026-10-07 | Accepted | Natural-language query mode deferred
**Decision:** Ship Direct SQL + prebuilt queries now; NL→SQL remains planned.
**Rationale:** Explicitly marked "planned capability" in scope; needs an LLM/grammar
strategy decision that shouldn't block core completion.
