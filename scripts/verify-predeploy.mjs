import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

function parseArgs(args) {
  const options = {
    coverageDir: process.env.GSC_COVERAGE_DIR,
    performanceDir: process.env.GSC_PERFORMANCE_DIR,
    skipGsc: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--coverage-dir') {
      options.coverageDir = args[index + 1];
      if (!options.coverageDir) throw new Error('--coverage-dir requires a directory path');
      index += 1;
      continue;
    }
    if (arg === '--performance-dir') {
      options.performanceDir = args[index + 1];
      if (!options.performanceDir) throw new Error('--performance-dir requires a directory path');
      index += 1;
      continue;
    }
    if (arg === '--skip-gsc') {
      options.skipGsc = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function existingDirectory(path, label) {
  if (!path) throw new Error(`Missing ${label}. Pass ${label} or set GSC_* env vars.`);
  const absolute = resolve(process.cwd(), path);
  if (!existsSync(absolute)) throw new Error(`${label} does not exist: ${absolute}`);
  return absolute;
}

function run(label, command, args) {
  console.log(`\n## ${label}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  run('Build deterministic dist', 'npm', ['run', 'build']);
  run('Verify local SEO/GEO crawl surface', 'node', ['scripts/verify-seo-dist.mjs']);

  if (options.skipGsc) {
    console.log('\n## Verify GSC exports');
    console.log('Skipped by --skip-gsc. Do not use this for production deploy approval.');
  } else {
    const coverageDir = existingDirectory(options.coverageDir, '--coverage-dir');
    const performanceDir = existingDirectory(options.performanceDir, '--performance-dir');
    run('Verify GSC export URL mapping', 'node', [
      'scripts/verify-gsc-exports.mjs',
      '--coverage-dir',
      coverageDir,
      '--performance-dir',
      performanceDir,
    ]);
  }

  run('Verify IndexNow payload without submitting', 'node', ['scripts/indexnow.mjs', '--dry-run']);
}

try {
  main();
} catch (error) {
  console.error(`\nPredeploy verification failed: ${error.message}`);
  process.exit(1);
}
