# Timeline — Turn the Tables

Append-only dated milestone log.

## 2025-12-19 — Repository created
- `main`: RN 0.83.1 scaffold, navigation shells, stub screens/services (`project_context.md` authored).
- `master`: separate scaffold-only branch (`scaffold.py` + empty module dir).

## 2026-10-07 — Scope completion session
- Repo fetched via stored GitHub HTTPS auth into local workspace; `main` adopted as working branch.
- `.docs/` hub created (roadmap / timeline / status / decisions / agent log).
- Decision: `main` becomes head branch; `master` slated for deletion.
- Dependencies installed (open-source only): op-sqlite, react-native-fs,
  react-native-permissions, react-native-share, async-storage, zustand.
- Phases 1–4 of roadmap implemented: real services, state store, theme system,
  all six screens wired to live data; natural-language query explicitly deferred.
- Typecheck (`tsc --noEmit`) green.

## Next
- On-device smoke test (rooted Android / emulator with root).
- GitHub: switch default branch to `main`, delete `master`.
