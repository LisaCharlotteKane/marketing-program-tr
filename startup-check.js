// Simple diagnostic script to check if the app can be loaded
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

console.log('Checking app dependencies and setup...');

// Check if package.json exists
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  const packagePath = join(__dirname, 'package.json');
  if (existsSync(packagePath)) {
    console.log('✓ package.json found');
    
    // Check if node_modules exists
    const nodeModulesPath = join(__dirname, 'node_modules');
    if (existsSync(nodeModulesPath)) {
      console.log('✓ node_modules directory found');
    } else {
      console.log('✗ node_modules directory missing - run npm install');
    }
    
    // Check main source files
    const srcPath = join(__dirname, 'src');
    if (existsSync(srcPath)) {
      console.log('✓ src directory found');
      
      const appPath = join(srcPath, 'App.tsx');
      if (existsSync(appPath)) {
        console.log('✓ App.tsx found');
      } else {
        console.log('✗ App.tsx missing');
      }
      
      const mainPath = join(srcPath, 'main.tsx');
      if (existsSync(mainPath)) {
        console.log('✓ main.tsx found');
      } else {
        console.log('✗ main.tsx missing');
      }
    } else {
      console.log('✗ src directory missing');
    }
    
    // Check index.html
    const indexPath = join(__dirname, 'index.html');
    if (existsSync(indexPath)) {
      console.log('✓ index.html found');
    } else {
      console.log('✗ index.html missing');
    }
    
  } else {
    console.log('✗ package.json not found');
  }
  
  console.log('\nIf all files are present, the 404 error is likely due to:');
  console.log('1. Development server not running');
  console.log('2. Wrong port or URL');
  console.log('3. Build process needed');
  console.log('\nTry running: npm run dev');
  
} catch (error) {
  console.error('Error checking app setup:', error);
}