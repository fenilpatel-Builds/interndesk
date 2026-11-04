import fs from "fs";
import path from "path";
import os from "os";

/**
 * Resolves a safe file path for data storage.
 * In local development and traditional container/VPS environments, it writes to `src/lib/data/<filename>`.
 * In serverless environments (e.g. Vercel, AWS Lambda) where project root is read-only,
 * it automatically falls back to the writable OS temporary directory `os.tmpdir()/interndesk-data/`.
 */
export function resolveDataFilePath(filename: string): string {
  const isServerless = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const projectDataDir = path.join(process.cwd(), "src", "lib", "data");

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), "interndesk-data");
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {
        // Ignored
      }
    }
    const targetPath = path.join(tmpDir, filename);

    // If file doesn't exist in tmp yet, but exists in projectDataDir, copy seed data
    const sourcePath = path.join(projectDataDir, filename);
    if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch {
        // Fallback to fresh creation
      }
    }

    return targetPath;
  }

  // Standard container / local environment
  if (!fs.existsSync(projectDataDir)) {
    try {
      fs.mkdirSync(projectDataDir, { recursive: true });
    } catch {
      // Fallback to tmp if local dir cannot be created
      const tmpDir = path.join(os.tmpdir(), "interndesk-data");
      if (!fs.existsSync(tmpDir)) {
        try {
          fs.mkdirSync(tmpDir, { recursive: true });
        } catch {
          // Ignored
        }
      }
      return path.join(tmpDir, filename);
    }
  }

  return path.join(projectDataDir, filename);
}
