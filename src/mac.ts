import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

export async function runAppleScript({
  script,
  humanReadableOutput = true,
}: {
  script: string;
  humanReadableOutput?: boolean;
}): Promise<string> {
  const outputArgs = humanReadableOutput ? [] : ["-ss"];
  const { stdout } = await execFileAsync("osascript", ["-e", script, ...outputArgs]);
  return stdout.trim();
}
