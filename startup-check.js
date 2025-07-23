// Simple diagnostic script to check if the app can be loaded
console.log('Checking app dependencies and setup...');

// Check if package.json exists
try {
  const fs = require('fs');
  const path = require('path');
  
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    console.log('✓ package.json found');
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      console.log('✓ node_modules directory found');
    } else {
      console.log('✗ node_modules directory missing - run npm install');
    }
    
    // Check main source files
    const srcPath = path.join(__dirname, 'src');
    if (fs.existsSync(srcPath)) {
      console.log('✓ src directory found');
      
      const appPath = path.join(srcPath, 'App.tsx');
      if (fs.existsSync(appPath)) {
        console.log('✓ App.tsx found');
      } else {
        console.log('✗ App.tsx missing');
      }
      
      const mainPath = path.join(srcPath, 'main.tsx');
      if (fs.existsSync(mainPath)) {
        console.log('✓ main.tsx found');
      } else {
        console.log('✗ main.tsx missing');
      }
    } else {
      console.log('✗ src directory missing');
    }
    
    // Check index.html
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
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