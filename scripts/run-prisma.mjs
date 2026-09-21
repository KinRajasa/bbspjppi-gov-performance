import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import nextEnv from '@next/env';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');

// Prisma CLI normally loads only .env. Loading through Next makes .env.local
// available to Prisma too, while the credentials remain ignored by Git.
nextEnv.loadEnvConfig(projectDirectory);

const prismaCli = resolve(projectDirectory, 'node_modules', 'prisma', 'build', 'index.js');
const result = spawnSync(process.execPath, [prismaCli, ...process.argv.slice(2)], {
  cwd: projectDirectory,
  env: process.env,
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
