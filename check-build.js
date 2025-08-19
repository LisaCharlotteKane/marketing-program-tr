const { spawn } = require('child_process');

const tsc = spawn('npx', ['tsc', '--noEmit'], {
  cwd: '/workspaces/spark-template',
  stdio: 'pipe'
});

let output = '';
let errors = '';

tsc.stdout.on('data', (data) => {
  output += data.toString();
});

tsc.stderr.on('data', (data) => {
  errors += data.toString();
});

tsc.on('close', (code) => {
  console.log('TypeScript Check Results:');
  console.log('Exit code:', code);
  if (output) {
    console.log('Output:\n', output);
  }
  if (errors) {
    console.log('Errors:\n', errors);
  }
  if (code === 0) {
    console.log('✅ No TypeScript errors found!');
  }
});
