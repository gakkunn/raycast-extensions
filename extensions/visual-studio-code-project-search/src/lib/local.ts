import os from "os";
import path from "path";
import fs from "fs/promises";

export async function getLocalProjects(projectRoots: string): Promise<string[]> {
  if (!projectRoots) {
    return [];
  }

  const roots = projectRoots
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  const projects = new Set<string>();

  async function safeAccess(target: string): Promise<boolean> {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  }

  const MAX_DEPTH = 6;
  const MAX_PROJECTS = 2000;
  const IGNORED_DIR_NAMES = new Set(["node_modules", ".git", ".venv", "venv", "dist", "build", ".DS_Store"]);

  async function scanDirectory(currentPath: string, depth: number): Promise<void> {
    if (depth > MAX_DEPTH || projects.size >= MAX_PROJECTS) {
      return;
    }

    if (!(await safeAccess(currentPath))) {
      return;
    }

    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      console.error(`Failed to read directory ${currentPath}`, error);
      return;
    }

    for (const entry of entries) {
      if (projects.size >= MAX_PROJECTS) {
        return;
      }

      if (!entry.isDirectory()) continue;

      const fullPath = path.join(currentPath, entry.name);

      if (IGNORED_DIR_NAMES.has(entry.name)) {
        continue;
      }

      projects.add(fullPath);

      await scanDirectory(fullPath, depth + 1);
    }
  }

  for (const root of roots) {
    const expandedRoot = root.replace(/^~/, os.homedir());
    await scanDirectory(expandedRoot, 0);
  }

  return Array.from(projects);
}
