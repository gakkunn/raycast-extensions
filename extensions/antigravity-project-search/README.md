# Antigravity Project Search

Antigravity Project Search is a Raycast extension that lets you quickly search and open Antigravity IDE projects.

## Features

- **Recent Projects**
  - Reads Antigravity’s `storage.json` to list recently opened folders and workspaces.
- **Local Projects**
  - Scans subdirectories under the directories defined in `Project Roots` and lists them as projects.
- **Per‑project actions**
  - Open in Antigravity
  - Open in a new window
  - Reveal in Finder
  - Copy path to clipboard

## Usage

1. Install this extension in Raycast and run the `Search Projects` command.
2. Type part of a project name or path (for example, `Lab3a`) into the search bar to filter the list.
3. Press Enter to open the project in Antigravity, or choose another action such as “Open in New Window”.

## Preferences

- `Project Roots`
  - Comma‑separated list of one or more directories.
  - Example: `~/Documents, ~/Dev`
  - All subdirectories under these roots (up to a certain depth) are treated as project candidates.

## Development

```bash
npm install
npm run dev    # Start Raycast in development mode
npm run build  # Build the extension
npm run lint   # Lint / format check
```
