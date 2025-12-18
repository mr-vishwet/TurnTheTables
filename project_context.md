# Project_Context.md

## 1. Overview

**Project Name:** Turn the Tables  
**Platform:** React Native (Android first, iOS planned)  
**Primary Audience:** Advanced users, developers, power users

Turn the Tables is a mobile application that scans a device for local SQLite databases created by installed apps and provides a powerful interface to explore, query, edit, and export that data. The app is designed to bring desktop-like database inspection capabilities directly to mobile, with a focus on clarity, safety, and speed.

---

## 2. Problem & Motivation

Most mobile apps store critical data in SQLite databases within their sandbox, but inspecting or manipulating that data typically requires:

- Rooted devices, emulators, or desktop tools.
- Manual extraction of database files.
- Non-intuitive workflows for quick debugging or analysis.

Turn the Tables aims to:

- Make it easy to **discover** which apps store what data.
- Provide an on-device, **intuitive UI** for navigating database structures.
- Enable **querying, editing, and exporting** data without leaving the phone.
- Help with **debugging, reverse-engineering, data analysis**, and **backup/migration** tasks.

---

## 3. Core Features (Functional Scope)

### 3.1 Device Scan & Discovery

- Scan device storage for SQLite databases associated with installed apps.
- Show scan progress (loading states, completion, error cases).
- Handle storage and file system permissions gracefully.
- Respect user preferences for including/excluding system apps.

### 3.2 Apps List

- List all detected apps that have associated SQLite databases.
- Show:
  - App name.
  - Number of databases found for that app.
- Tap on an app to drill down into its database list.
- Reflect the “Show System Apps” setting (user can hide OS/system entries).

### 3.3 Database & Tables Tree

- Hierarchical view per app:
  - **App → Databases → Tables → Columns**
- Display metadata:
  - Database names.
  - Table names.
  - Column names and types.
- Tap-through navigation:
  - From app to database.
  - From database to tables.
  - From table to table data view.

### 3.4 Table Data View

- Show table contents in a **tabular, paginated** format.
- Allow:
  - Filtering by column values.
  - Searching across columns.
- Interactions:
  - Long-press on cells to **edit** or **copy** values.
  - Delete a **row**, **table**, or **database** with confirmation dialogs.
  - Create new tables (with basic schema definition).
- Export:
  - Table structure and/or data to **JSON**.
  - Tabular exports to **CSV/TSV** for external tools.

### 3.5 Query Master

- Dual-mode query interface:
  - **Direct SQL:** User writes SQL and executes directly against selected DB.
  - **Guided / Natural Language:** User inputs simple English; app translates to SQL (planned capability).
- Output:
  - Display results in a table/grid format.
- Utilities:
  - Prebuilt queries (e.g., “Show all tables”, “Show row count”, “List indexes”).
  - Query history list for quick re-run and editing.
- Export:
  - Export query results as **CSV** or **JSON**.

### 3.6 Settings & Preferences

- Toggle: **Show System Apps** (on/off).
- Preference: **Default export format** (JSON or CSV).
- Basic **About/Help** section:
  - Brief explanation of capabilities, limitations, and safety notes.
- Planned:
  - **Theme switch (Light/Dark)** for better visual comfort.

### 3.7 UX & Interaction Details

- Long-press on data cells for contextual actions (edit/copy).
- Confirmation dialogs for destructive operations (delete row/table/database).
- Pagination on large tables and query results to maintain performance.
- Consistent loading, success, and error feedback banners/modals.
- Simple, clean layouts optimized for small screens.

---

## 4. Architecture & Modular Design

### 4.1 High-Level Architecture

- **Approach:** Feature-based modular structure with light Clean Architecture.
- **Concepts:**
  - Group by **feature/domain** (scan, apps, dbBrowser, query, settings).
  - Shared **core layer** for services, types, and utilities.
  - UI and state kept close to features; business logic in services.

### 4.2 Module Breakdown

- `modules/scan`  
  - Screens for scanning device and showing progress.
  - Logic for triggering and monitoring scan operations.

- `modules/apps`  
  - Screens for listing apps with databases.
  - Logic for mapping scan results into user-friendly app entries.

- `modules/dbBrowser`  
  - Screens for database tree and table data views.
  - Logic for exploring DB structure and performing CRUD operations on data/tables.

- `modules/query`  
  - Screens for Query Master.
  - Logic for building, executing, and storing queries and their results.

- `modules/settings`  
  - Screens for preferences and about/help.
  - Logic for toggles, default export formats, and theme options.

- `modules/core`  
  - **Services:** SQLite access, query execution, file export, permissions.
  - **Types:** Shared models for apps, databases, tables, columns, query results.
  - **Hooks/Utils:** Shared hooks and helpers.

- `modules/navigation`  
  - Root navigation container and bottom tab navigator.
  - Per-feature stacks (Home/Scan, Query, Settings).

---

## 5. Theming & Design System

- **Theme file:** `src/theme/index.ts`
- **Design tokens:**
  - Colors for primary, background, surface, text, borders, semantic states (success, error).
  - Typography for font families, weights, and sizes.
  - Spacing scale (e.g., 4-based or 8-based).
  - Radii for cards, pills, and sheets.
- Used consistently across:
  - Buttons, inputs, tables, banners, dialogs.
  - Screen backgrounds and text styles.

---

## 6. Common Components

Stored under `src/components/common/`:

- **Buttons:** Primary, secondary, icon-only.
- **Inputs:** Labeled text input, search input, multi-line query input.
- **Feedback:** Loading indicator, status banners (success/error/info), confirmation dialog.
- **Layout:** Standard screen container with safe area and padding, section headers.
- **Data/UI helpers:** Empty state component, tags/chips, pill-like filters.

---

## 7. Non-Functional Concerns

- **Performance:**
  - Pagination for large datasets.
  - Efficient rendering lists/tables.
- **Reliability:**
  - Clear error handling for IO, permission denial, and invalid queries.
  - Protective checks before destructive operations.
- **Security & Safety:**
  - Work within the OS permission model.
  - Make the user explicitly confirm when editing/deleting data.
- **Extensibility (Future):**
  - Dark mode and extended theming.
  - Cloud backup/sync of exported data.
  - Additional DB types (if needed).

---

## 8. Status & Next Steps

- Figma UI: initial flows for Scan, Apps List, DB Tree, Table View, Query Master, Settings.
- Codebase: modular structure and scaffolding.
- Next:
  - Finalize state management choice.
  - Implement real `sqliteService` and permission integration.
  - Wire UI screens to real data and export functionality.
