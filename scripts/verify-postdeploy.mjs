import { spawnSync } from 'child_process';

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
  run('Verify live SEO/GEO crawl surface', 'npm', ['run', 'verify:live']);
  run('Verify live IndexNow payload without submitting', 'node', [
    'scripts/indexnow.mjs',
    '--dry-run',
    '--live-sitemap',
  ]);
}

try {
  main();
} catch (error) {
  console.error(`\nPostdeploy verification failed: ${error.message}`);
  process.exit(1);
}
