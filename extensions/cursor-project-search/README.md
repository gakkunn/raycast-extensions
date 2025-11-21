# Cursor Project Search

Cursor Project Search is a Raycast extension that lets you quickly search and open Cursor IDE projects.

## Features

- **Recent Projects**
  - Reads Cursor’s `storage.json` at `~/Library/Application Support/Cursor/User/globalStorage/storage.json` (when present) to list recently opened folders and workspaces.
- **Local Projects**
  - Scans subdirectories under the directories defined in `Project Roots` and lists them as project candidates (with depth and count limits, ignoring heavy folders like `node_modules`, `.git`, `dist`, etc.).
- **Per-project actions**
  - Open in Cursor
  - Open in a new window (via Cursor CLI)
  - Reveal in Finder
  - Copy path to clipboard

## Requirements

- macOS
- [Raycast](https://www.raycast.com/)
- [Cursor](https://cursor.sh/)
- Cursor CLI available either on your `PATH` (`cursor`) or in a common install location such as:
  - `/usr/local/bin/cursor`
  - `/opt/homebrew/bin/cursor`
  - `~/.cursor/bin/cursor`

If the CLI cannot be found, the extension will show an error toast when you try to open a project in a new window.

## Usage

1. Install this extension in Raycast and run the **Search Projects** command (subtitle: **Cursor**).
2. Optionally configure the `Project Roots` preference for the command (see below).
3. Use the search bar to filter by project name or path.
4. From the list:
   - Items under **Recent Projects** come from Cursor’s recent history.
   - Items under **Local Projects** are discovered by scanning your configured roots.
5. Press Enter to open the project in Cursor, or choose an alternative action such as **Open in New Window**.

## Preferences

- `Project Roots`
  - Comma-separated list of one or more directories to scan for local projects.
  - Example: `~/Documents, ~/Dev`
  - All subdirectories under these roots (up to a certain depth) are treated as project candidates, except for ignored folders like `node_modules` or `.git`.

## Data sources

- **Recent Projects**
  - `~/Library/Application Support/Cursor/User/globalStorage/storage.json`
  - The extension parses Cursor’s internal structures (backup workspaces, window state, opened paths list) and keeps only paths that still exist on disk.
- **Local Projects**
  - Directories discovered under your configured `Project Roots`, with safeguards on recursion depth and maximum number of collected projects.

## Development

```bash
npm install

# Start Raycast in development mode
npm run dev

# Build the extension bundle
npm run build

# Lint (ESLint + Prettier + Raycast checks, relaxed schema/icons validation)
npm run lint

# Attempt to auto-fix lint issues
npm run fix-lint
```

You need the Raycast CLI (`ray`) installed locally for the `dev`, `build`, and `lint` scripts to work.
