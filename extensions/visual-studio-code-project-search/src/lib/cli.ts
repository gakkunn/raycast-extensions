import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

const DARWIN_CANDIDATES = [
  "/usr/local/bin/code",
  "/opt/homebrew/bin/code",
  process.env.HOME ? path.join(process.env.HOME, ".vscode/bin/code") : "",
];

const LINUX_CANDIDATES = ["/usr/local/bin/code", "/usr/bin/code"];

const WINDOWS_CANDIDATES = [
  path.join(process.env["ProgramFiles"] || "", "Microsoft VS Code", "bin", "code.cmd"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft VS Code", "bin", "code.cmd"),
];

async function resolveCliFromPath(): Promise<string | undefined> {
  const locator = process.platform === "win32" ? "where" : "which";

  try {
    const { stdout } = await execFileAsync(locator, ["code"], { encoding: "utf8" });
    const candidate = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);
    return candidate;
  } catch {
    return undefined;
  }
}

async function getCliPath(): Promise<string> {
  const candidates =
    process.platform === "darwin"
      ? DARWIN_CANDIDATES
      : process.platform === "win32"
        ? WINDOWS_CANDIDATES
        : LINUX_CANDIDATES;

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const discovered = await resolveCliFromPath();
  if (discovered) {
    return discovered;
  }

  throw new Error("VS Code CLI not found. Please ensure 'code' is installed and in your PATH.");
}

export async function openProjectInNewWindow(projectPath: string): Promise<void> {
  const cli = await getCliPath();
  await execFileAsync(cli, ["-n", projectPath]);
}
