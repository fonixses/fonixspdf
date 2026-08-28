import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
export async function runBinary(binary: string, args: string[]) {
  try { return await run(binary, args, { timeout: 120_000, maxBuffer: 8 * 1024 * 1024, windowsHide: true }); }
  catch (error) {
    const failure = error as NodeJS.ErrnoException & { stderr?: string };
    if (failure.code === "ENOENT") throw new Error(`${binary} is not installed. See the README system dependencies section.`);
    throw new Error(failure.stderr?.trim() || `${binary} could not process this file.`);
  }
}
