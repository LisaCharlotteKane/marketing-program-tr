// Comprehensive diagnostic script to check app functionality and availability
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

console.log('🔍 Marketing Campaign Planner - Comprehensive Health Check');
console.log('='.repeat(60));

let issues = [];
let warnings = [];
let successes = [];

function logSuccess(message) {
  console.log(`✓ ${message}`);
  successes.push(message);
}

function logWarning(message) {
  console.log(`⚠ ${message}`);
  warnings.push(message);
}

function logError(message) {
  console.log(`✗ ${message}`);
  issues.push(message);
}

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  console.log('\n📁 FILE STRUCTURE CHECK');
  console.log('-'.repeat(30));
  
  // Check core files
  const coreFiles = [
    'package.json',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    'tailwind.config.js'
  ];
  
  for (const file of coreFiles) {
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
      logSuccess(`${file} found`);
    } else {
      logError(`${file} missing`);
    }
  }
  
  // Check package.json content
  const packagePath = join(__dirname, 'package.json');
  if (existsSync(packagePath)) {
    try {
      const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
      logSuccess(`Package name: ${packageContent.name}`);
      logSuccess(`Scripts available: ${Object.keys(packageContent.scripts).join(', ')}`);
      
      // Check for critical dependencies
      const criticalDeps = ['react', 'react-dom', 'vite', 'typescript'];
      for (const dep of criticalDeps) {
        if (packageContent.dependencies?.[dep] || packageContent.devDependencies?.[dep]) {
          logSuccess(`${dep} dependency found`);
        } else {
          logError(`${dep} dependency missing`);
        }
      }
      
      // Check for GitHub Spark dependency
      if (packageContent.dependencies?.['@github/spark']) {
        logWarning(`@github/spark dependency present - may require GitHub Spark environment`);
      }
      
    } catch (e) {
      logError(`package.json is not valid JSON: ${e.message}`);
    }
  }
  
  // Check node_modules
  const nodeModulesPath = join(__dirname, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    logSuccess('node_modules directory found');
  } else {
    logError('node_modules directory missing - run npm install');
  }
  
  console.log('\n📂 SOURCE CODE CHECK');
  console.log('-'.repeat(30));
  
  // Check source structure
  const srcPath = join(__dirname, 'src');
  if (existsSync(srcPath)) {
    logSuccess('src directory found');
    
    const sourceFiles = [
      'App.tsx',
      'main.tsx',
      'index.css'
    ];
    
    for (const file of sourceFiles) {
      const filePath = join(srcPath, file);
      if (existsSync(filePath)) {
        logSuccess(`${file} found`);
      } else {
        logError(`${file} missing`);
      }
    }
    
    // Check components directory
    const componentsPath = join(srcPath, 'components');
    if (existsSync(componentsPath)) {
      logSuccess('components directory found');
    } else {
      logWarning('components directory missing');
    }
    
    // Check services directory
    const servicesPath = join(srcPath, 'services');
    if (existsSync(servicesPath)) {
      logSuccess('services directory found');
    } else {
      logWarning('services directory missing');
    }
  } else {
    logError('src directory missing');
  }
  
  console.log('\n🧪 DIAGNOSTIC FILES CHECK');
  console.log('-'.repeat(30));
  
  const diagnosticFiles = [
    'test-app-fix.html',
    'campaign-count-check.js',
    'startup-check.js'
  ];
  
  for (const file of diagnosticFiles) {
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
      logSuccess(`${file} available`);
    } else {
      logWarning(`${file} missing`);
    }
  }
  
  console.log('\n📊 SUMMARY REPORT');
  console.log('='.repeat(30));
  console.log(`✓ Successes: ${successes.length}`);
  console.log(`⚠ Warnings: ${warnings.length}`);
  console.log(`✗ Issues: ${issues.length}`);
  
  if (issues.length === 0) {
    console.log('\n🎉 All critical checks passed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Run: npm run dev (to start development server)');
    console.log('2. Open: http://localhost:5000 (default Vite port)');
    console.log('3. Test: Open test-app-fix.html for runtime diagnostics');
  } else {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    issues.forEach(issue => console.log(`   • ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  console.log('\n🔧 TROUBLESHOOTING GUIDE:');
  console.log('• If node_modules missing: npm install');
  console.log('• If build fails: Check vite.config.ts dependencies');
  console.log('• If GitHub Spark errors: App may need Spark environment');
  console.log('• For runtime testing: Open test-app-fix.html in browser');
  
} catch (error) {
  console.error('❌ Error during health check:', error);
}