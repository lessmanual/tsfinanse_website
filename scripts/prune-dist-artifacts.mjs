import { existsSync, readdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const numberedDuplicatePattern = / \d+(?:\.[^/.]+)?$/;

function pruneGeneratedArtifacts(dir) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.name === '.DS_Store' || numberedDuplicatePattern.test(entry.name)) {
      rmSync(path, { recursive: true, force: true });
      continue;
    }

    if (entry.isDirectory()) {
      pruneGeneratedArtifacts(path);
    }
  }
}

pruneGeneratedArtifacts(distDir);
