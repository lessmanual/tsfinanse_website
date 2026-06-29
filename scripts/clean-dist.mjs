import { rmSync } from 'fs';
import { resolve } from 'path';

rmSync(resolve(process.cwd(), 'dist'), {
  recursive: true,
  force: true,
  maxRetries: 10,
  retryDelay: 100,
});
