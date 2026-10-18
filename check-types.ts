import { execSync } from 'child_process';

try {
  const output = execSync('npx tsc --noEmit', {
    cwd: 'D:/Ambarsan/Ambarsan-Exam',
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('SUCCESS:', output);
} catch (error: any) {
  console.error('ERROR:', error.message);
  if (error.stdout) console.log('STDOUT:', error.stdout);
  if (error.stderr) console.error('STDERR:', error.stderr);
  process.exit(1);
}