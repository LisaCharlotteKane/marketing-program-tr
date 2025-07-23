#!/usr/bin/env node

// Quick Application Status Summary
console.log('🏥 Marketing Campaign Planner - Quick Status Check');
console.log('='.repeat(55));

import { existsSync } from 'fs';

// Quick file checks
const critical = ['package.json', 'src/App.tsx', 'index.html'];
const diagnostic = ['startup-check.js', 'comprehensive-health-check.html', 'availability-monitor.js'];

console.log('\n📋 QUICK STATUS:');

let allCritical = true;
for (const file of critical) {
  if (!existsSync(file)) {
    allCritical = false;
    break;
  }
}

let allDiagnostic = true;  
for (const file of diagnostic) {
  if (!existsSync(file)) {
    allDiagnostic = false;
    break;
  }
}

const hasNodeModules = existsSync('node_modules');

if (allCritical && hasNodeModules && allDiagnostic) {
  console.log('🟢 STATUS: EXCELLENT - All systems ready');
  console.log('✅ Core files: Present');
  console.log('✅ Dependencies: Installed');
  console.log('✅ Diagnostics: Available');
} else if (allCritical && hasNodeModules) {
  console.log('🟡 STATUS: GOOD - Core systems ready');
  console.log('✅ Core files: Present');
  console.log('✅ Dependencies: Installed');
  console.log('⚠️  Diagnostics: Some missing');
} else {
  console.log('🔴 STATUS: NEEDS ATTENTION');
  console.log(`${allCritical ? '✅' : '❌'} Core files: ${allCritical ? 'Present' : 'Missing'}`);
  console.log(`${hasNodeModules ? '✅' : '❌'} Dependencies: ${hasNodeModules ? 'Installed' : 'Missing'}`);
  console.log(`${allDiagnostic ? '✅' : '❌'} Diagnostics: ${allDiagnostic ? 'Available' : 'Missing'}`);
}

console.log('\n🚀 QUICK ACTIONS:');
console.log('• Full diagnostics: node startup-check.js');
console.log('• Browser testing: open comprehensive-health-check.html');
console.log('• Availability check: node availability-monitor.js');
console.log('• Start server: npm run dev');

console.log('\n📚 DOCUMENTATION:');
console.log('• Health Check Guide: HEALTH_CHECK_README.md');
console.log('• Export Instructions: EXPORT_INSTRUCTIONS.md');