import os from "os";
import path from "path";
import fs from "fs/promises";

interface SimplePathEntry {
  path?: string;
  uri?: string;
}

interface WorkspaceEntry {
  configPath?: string;
  configURIPath?: string;
}

interface OpenedEntry {
  folderUri?: string;
  fileUri?: string;
  workspace?: WorkspaceEntry;
}

interface OpenedPathsList {
  // Loosely typed to stay compatible with Antigravity / VS Code formats
  workspaces?: (string | SimplePathEntry)[];
  folders?: (string | SimplePathEntry)[];
  entries?: OpenedEntry[];
}

interface BackupWorkspaceEntry {
  workspaceUri?: string;
}

interface BackupFolderEntry {
  folderUri?: string;
}

interface BackupWorkspaces {
  workspaces?: (string | BackupWorkspaceEntry)[];
  folders?: BackupFolderEntry[];
  emptyWindows?: unknown;
}

interface WindowEntry {
  folder?: string;
}

interface WindowsState {
  lastActiveWindow?: WindowEntry;
  openedWindows?: WindowEntry[];
}

interface Storage {
  openedPathsList?: OpenedPathsList;
  backupWorkspaces?: BackupWorkspaces;
  windowsState?: WindowsState;
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function getRecentProjects(): Promise<string[]> {
  const homeDir = os.homedir();
  // Path to Antigravity's storage.json on macOS
  const storagePath = path.join(
    homeDir,
    "Library",
    "Application Support",
    "Antigravity",
    "User",
    "globalStorage",
    "storage.json",
  );

  if (!(await pathExists(storagePath))) {
    return [];
  }

  try {
    const content = await fs.readFile(storagePath, "utf-8");
    const data = JSON.parse(content) as Storage;

    const allPaths: string[] = [];
    const openedPathsList = data.openedPathsList;

    // 1. Collect from Antigravity's backupWorkspaces section
    const backupWorkspaces = data.backupWorkspaces;
    if (backupWorkspaces) {
      const folders = backupWorkspaces.folders;
      if (Array.isArray(folders)) {
        for (const folder of folders) {
          if (folder && typeof folder.folderUri === "string") {
            allPaths.push(folder.folderUri);
          }
        }
      }

      const workspaces = backupWorkspaces.workspaces;
      if (Array.isArray(workspaces)) {
        for (const ws of workspaces) {
          if (typeof ws === "string") {
            allPaths.push(ws);
          } else if (ws && typeof ws.workspaceUri === "string") {
            allPaths.push(ws.workspaceUri);
          }
        }
      }
    }

    // 2. Collect folders from windowsState (currently / recently opened windows)
    const windowsState = data.windowsState;
    if (windowsState) {
      const last = windowsState.lastActiveWindow;
      if (last && typeof last.folder === "string") {
        allPaths.push(last.folder);
      }

      const opened = windowsState.openedWindows;
      if (Array.isArray(opened)) {
        for (const win of opened) {
          if (win && typeof win.folder === "string") {
            allPaths.push(win.folder);
          }
        }
      }
    }

    // 3. Also read openedPathsList for future compatibility
    if (openedPathsList) {
      // VS Code-style entries array
      if (Array.isArray(openedPathsList.entries)) {
        for (const entry of openedPathsList.entries) {
          if (!entry) continue;

          if (typeof entry.folderUri === "string") {
            allPaths.push(entry.folderUri);
          }

          if (typeof entry.fileUri === "string") {
            allPaths.push(entry.fileUri);
          }

          if (entry.workspace) {
            const w = entry.workspace;
            if (typeof w.configPath === "string") {
              allPaths.push(w.configPath);
            }
            if (typeof w.configURIPath === "string") {
              allPaths.push(w.configURIPath);
            }
          }
        }
      }

      // Legacy string-array formats
      const workspaces = openedPathsList.workspaces;
      const folders = openedPathsList.folders;

      for (const collection of [workspaces, folders]) {
        if (Array.isArray(collection)) {
          for (const value of collection) {
            if (typeof value === "string") {
              allPaths.push(value);
            } else if (value) {
              const v = value;
              if (typeof v.path === "string") {
                allPaths.push(v.path);
              } else if (typeof v.uri === "string") {
                allPaths.push(v.uri);
              }
            }
          }
        }
      }
    }

    // Filter out paths that don't exist
    // Also decode URI components if they are stored as URIs (VS Code sometimes stores them as file://)
    // In other cases they are already plain paths.

    const decoded = allPaths
      .filter((p) => typeof p === "string" && p.length > 0)
      .map((p) => {
        if (p.startsWith("file://")) {
          // file:// URI -> local filesystem path
          return decodeURIComponent(p.replace("file://", ""));
        }
        return p;
      });

    const validPaths: string[] = [];
    for (const candidate of decoded) {
      if (await pathExists(candidate)) {
        validPaths.push(candidate);
      }
    }

    // Remove duplicates
    return Array.from(new Set(validPaths));
  } catch (error) {
    console.error("Failed to parse storage.json", error);
    throw error;
  }
}
