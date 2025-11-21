# Visual Studio Code Project Search

Search and open recent or local projects for VS Code directly from Raycast.

## Features
- Recent projects: reads VS Code `storage.json` and lists projects you've opened recently.
- Local search: scans user-specified roots for project folders with depth and count limits.
- Quick actions: open in the current VS Code instance, open a new window (`code -n`), show in Finder, copy path.

## Installing
1) Install dependencies:
```bash
npm install
```
2) Develop or build in Raycast:
```bash
npm run dev   # ray develop
# or
npm run build # ray build
```

## Usage
- Open Raycast and run the command **Search Projects (VScode)**.
- Configure search roots via the command preferences:
  - `Project Roots`: comma-separated paths (e.g., `~/Documents, ~/Dev`).
- The list shows:
  - **Recent Projects** from VS Code history.
  - **Local Projects** discovered under the configured roots.
- Actions per item:
  - Open in VS Code
  - Open in New Window
  - Show in Finder
  - Copy Path

## Configuration Details
- Recent history file locations:
  - macOS: `~/Library/Application Support/Code/User/globalStorage/storage.json`
  - Windows: `%APPDATA%/Code/User/globalStorage/storage.json`
  - Linux: `~/.config/Code/User/globalStorage/storage.json`
- Local search behavior:
  - Expands `~` to the home directory.
  - Depth limit: 6; max projects: 2000.
  - Skips directories: `node_modules`, `.git`, `.venv`, `venv`, `dist`, `build`, `.DS_Store`.

## Scripts
- `npm run dev`: start Raycast develop mode.
- `npm run build`: build the extension.
- `npm run lint`: run Raycast lint (includes ESLint/Prettier/schema checks).
- `npm run fix-lint`: `ray lint --fix`.

## Notes
- If VS Code stores history only in `state.vscdb`, recent projects may be empty; `storage.json` is used here for simplicity.
- Ensure the VS Code CLI `code` is installed and on PATH for the “Open in New Window” action. On macOS, run “Shell Command: Install 'code' command in PATH” from VS Code Command Palette if needed.
