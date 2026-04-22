#!/usr/bin/env node
/**
 * reset-to-template.mjs
 *
 * Replaces the contents of src/data/ with the generic template content
 * from src/data-template/. Intended for onboarding a new researcher
 * onto this codebase.
 *
 * Safety measures:
 *   1. Refuses to run if the git working directory is dirty.
 *   2. Requires explicit confirmation (interactive prompt, or CONFIRM_RESET=yes env var).
 *   3. Backs up the existing src/data/ to src/data.backup-{timestamp}/ before overwriting.
 *
 * Usage:
 *   npm run reset-to-template
 *   CONFIRM_RESET=yes npm run reset-to-template   # skip prompt (CI or scripted use)
 */

import { execSync } from 'node:child_process';
import { cp, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const SOURCE = 'src/data-template';
const TARGET = 'src/data';

function die(msg, code = 1) {
  console.error(`❌ ${msg}`);
  process.exit(code);
}

async function requireCleanGit() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      console.error('❌ Working directory has uncommitted changes:');
      console.error();
      console.error(status.split('\n').map((l) => '  ' + l).join('\n'));
      console.error();
      die('Commit or stash your changes before running the reset script.');
    }
  } catch (e) {
    die(`Could not run 'git status'. Is this a git repo? (${e.message})`);
  }
}

async function requireConfirmation() {
  if (process.env.CONFIRM_RESET === 'yes') return;

  console.log('⚠️  This will REPLACE all content in src/data/ with generic template content.');
  console.log('    Your existing content will be backed up to src/data.backup-{timestamp}/');
  console.log();
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('    Type "yes" to continue (anything else cancels): ');
  rl.close();
  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('Aborted.');
    process.exit(0);
  }
}

async function backup() {
  if (!existsSync(TARGET)) return null;
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 16);
  const backupPath = `${TARGET}.backup-${timestamp}`;
  await cp(TARGET, backupPath, { recursive: true });
  return backupPath;
}

async function main() {
  // Sanity check: source exists
  if (!existsSync(SOURCE)) {
    die(`Template source directory '${SOURCE}' not found. Cannot reset.`);
  }

  await requireCleanGit();
  await requireConfirmation();

  console.log();

  const backupPath = await backup();
  if (backupPath) {
    console.log(`📦 Backed up existing content → ${backupPath}/`);
  }

  await rm(TARGET, { recursive: true, force: true });
  await cp(SOURCE, TARGET, { recursive: true });
  console.log(`✅ ${TARGET}/ replaced with content from ${SOURCE}/`);

  console.log();
  console.log('Next steps:');
  console.log('  1. Review what changed:     git status && git diff');
  console.log('  2. Test the build:          npm run build');
  console.log('  3. Commit the reset:        git add -A && git commit -m "reset: scaffold with template content"');
  console.log('  4. Deploy, then customize your content via the CMS at /admin');
  console.log();
  console.log('If you need to roll back, the backup directory is still in place.');
}

main().catch((e) => {
  console.error('❌ Reset failed:', e.message);
  process.exit(1);
});
