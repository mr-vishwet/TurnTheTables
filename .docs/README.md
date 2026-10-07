# .docs — Development Documentation Hub

All developmental artifacts for **Turn the Tables** live here: roadmaps, timelines,
status reports, architecture decisions, and agent session logs. Agents must append
their work here (never overwrite prior entries) so the project history stays auditable.

## Index

| File | Purpose | Update rule |
|---|---|---|
| [roadmap.md](roadmap.md) | Phased plan to full scope | Edit phases; mark completion |
| [timeline.md](timeline.md) | Dated milestone log | Append only |
| [status.md](status.md) | Feature-by-feature completion vs scope | Rewrite as state changes |
| [decisions.md](decisions.md) | Architecture decision records (ADRs) | Append only |
| [agent-log.md](agent-log.md) | Per-session agent work log | Append only |

## Conventions

- Dates in `YYYY-MM-DD` format.
- Every agent session ends with: an `agent-log.md` entry + `status.md` refresh.
- Branch policy: **`main` is the head branch** of this repo. `master` (legacy scaffold
  branch) is slated for deletion; all work lands on `main`.
