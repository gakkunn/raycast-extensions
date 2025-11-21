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

function getStoragePath(): string | undefined {
  const homeDir = os.homedir();

  if (process.platform === "darwin") {
    return path.join(homeDir, "Library", "Application Support", "Code", "User", "globalStorage", "storage.json");
  }

  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(homeDir, "AppData", "Roaming");
    return path.join(appData, "Code", "User", "globalStorage", "storage.json");
  }

  // Linux and other Unix-like platforms
  return path.join(homeDir, ".config", "Code", "User", "globalStorage", "storage.json");
}

export async function getRecentProjects(): Promise<string[]> {
  const storagePath = getStoragePath();

  if (!storagePath || !(await pathExists(storagePath))) {
    return [];
  }

  try {
    const content = await fs.readFile(storagePath, "utf-8");
    const data = JSON.parse(content) as Storage;

    const allPaths: string[] = [];
    const openedPathsList = data.openedPathsList;

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

    if (openedPathsList) {
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

    const decoded = allPaths
      .filter((p) => typeof p === "string" && p.length > 0)
      .map((p) => {
        if (p.startsWith("file://")) {
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

    return Array.from(new Set(validPaths));
  } catch (error) {
    console.error("Failed to parse VS Code storage.json", error);
    throw error;
  }
}
