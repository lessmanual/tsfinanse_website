import { spawnSync } from 'child_process';

const REQUIRED_BRANCH = 'temp-main';
const REMOTE_REF = 'refs/remotes/origin/main';

function run(label, command, args, options = {}) {
  console.log(`\n## ${label}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.capture && result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${label} failed with exit code ${result.status}`);
  }

  return options.capture ? result.stdout.trim() : '';
}

function assertCleanTrackedWorktree() {
  run('Check tracked working tree changes', 'git', ['diff', '--quiet']);
  run('Check staged changes', 'git', ['diff', '--cached', '--quiet']);
}

function verifyGitReleaseDelta() {
  const branch = run('Read current branch', 'git', ['branch', '--show-current'], { capture: true });
  if (branch !== REQUIRED_BRANCH) {
    throw new Error(`Expected branch ${REQUIRED_BRANCH}, got ${branch || '(detached)'}`);
  }

  run('Fetch production branch metadata', 'git', ['fetch', 'origin', 'main']);

  const head = run('Read HEAD', 'git', ['rev-parse', '--short', 'HEAD'], { capture: true });
  const originMain = run('Read origin/main', 'git', ['rev-parse', '--short', REMOTE_REF], { capture: true });
  const mergeBase = run('Read merge-base', 'git', ['merge-base', 'HEAD', REMOTE_REF], { capture: true }).slice(0, 7);
  const ahead = Number(run('Count commits ahead of origin/main', 'git', ['rev-list', '--count', `${REMOTE_REF}..HEAD`], { capture: true }));
  const behind = Number(run('Count commits behind origin/main', 'git', ['rev-list', '--count', `HEAD..${REMOTE_REF}`], { capture: true }));

  if (!Number.isInteger(ahead) || !Number.isInteger(behind)) {
    throw new Error(`Invalid ahead/behind counts: ahead=${ahead}, behind=${behind}`);
  }
  if (behind !== 0) {
    throw new Error(`Local branch is behind origin/main by ${behind} commits. Merge/rebase before deploy.`);
  }
  if (ahead < 1) {
    throw new Error('Local branch has no commits to deploy.');
  }
  if (mergeBase !== originMain) {
    throw new Error(`origin/main is not the merge-base. mergeBase=${mergeBase}, origin/main=${originMain}`);
  }

  console.log(JSON.stringify({
    branch,
    head,
    originMain,
    mergeBase,
    ahead,
    behind,
  }, null, 2));
}

function main() {
  const predeployArgs = process.argv.slice(2);

  assertCleanTrackedWorktree();
  verifyGitReleaseDelta();
  run('Verify local predeploy gate', 'npm', ['run', 'verify:predeploy', '--', ...predeployArgs]);
}

try {
  main();
} catch (error) {
  console.error(`\nRelease verification failed: ${error.message}`);
  process.exit(1);
}
