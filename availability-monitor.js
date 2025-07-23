#!/usr/bin/env node

// Comprehensive Application Availability Monitor
// This script checks the availability and health of the Marketing Campaign Planner

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌐 Marketing Campaign Planner - Availability Monitor');
console.log('='.repeat(60));

async function checkServerAvailability() {
  const ports = [5000, 3000, 8080];
  const results = [];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      
      results.push({
        port,
        available: response.ok,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error) {
      results.push({
        port,
        available: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function checkApplicationHealth() {
  console.log('\n🔍 APPLICATION HEALTH CHECK');
  console.log('-'.repeat(30));
  
  let healthScore = 0;
  let maxScore = 0;
  
  // Check core files
  const criticalFiles = [
    'package.json',
    'index.html',
    'src/App.tsx',
    'src/main.tsx'
  ];
  
  console.log('\n📁 Core Files:');
  for (const file of criticalFiles) {
    maxScore++;
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
      console.log(`✅ ${file}`);
      healthScore++;
    } else {
      console.log(`❌ ${file}`);
    }
  }
  
  // Check diagnostic tools
  const diagnosticFiles = [
    'startup-check.js',
    'comprehensive-health-check.html',
    'test-app-fix.html'
  ];
  
  console.log('\n🧪 Diagnostic Tools:');
  for (const file of diagnosticFiles) {
    maxScore++;
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
      console.log(`✅ ${file}`);
      healthScore++;
    } else {
      console.log(`❌ ${file}`);
    }
  }
  
  // Check dependencies
  console.log('\n📦 Dependencies:');
  maxScore++;
  const nodeModulesPath = join(__dirname, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    console.log(`✅ node_modules installed`);
    healthScore++;
  } else {
    console.log(`❌ node_modules missing - run: npm install`);
  }
  
  return { healthScore, maxScore };
}

async function monitorAvailability() {
  console.log('\n🌐 SERVER AVAILABILITY CHECK');
  console.log('-'.repeat(30));
  
  const serverResults = await checkServerAvailability();
  let hasAvailableServer = false;
  
  for (const result of serverResults) {
    if (result.available) {
      console.log(`✅ Port ${result.port}: Available (${result.status} ${result.statusText})`);
      hasAvailableServer = true;
    } else {
      console.log(`❌ Port ${result.port}: ${result.error || 'Not available'}`);
    }
  }
  
  if (!hasAvailableServer) {
    console.log('\n💡 No servers detected. To start the application:');
    console.log('   1. Standard mode: npm run dev');
    console.log('   2. Standalone mode: npx vite --config vite.config.standalone.ts');
    console.log('   3. Static serve: python3 -m http.server 8080');
  }
  
  return hasAvailableServer;
}

async function generateAvailabilityReport() {
  const timestamp = new Date().toISOString();
  
  console.log('\n📊 AVAILABILITY REPORT');
  console.log('='.repeat(30));
  console.log(`Generated: ${timestamp}`);
  
  const { healthScore, maxScore } = await checkApplicationHealth();
  const hasServer = await monitorAvailability();
  
  const healthPercentage = Math.round((healthScore / maxScore) * 100);
  
  console.log('\n🎯 SUMMARY:');
  console.log(`📋 Health Score: ${healthScore}/${maxScore} (${healthPercentage}%)`);
  console.log(`🌐 Server Available: ${hasServer ? 'Yes' : 'No'}`);
  
  // Determine overall status
  let overallStatus;
  let statusEmoji;
  
  if (healthPercentage >= 90 && hasServer) {
    overallStatus = 'EXCELLENT';
    statusEmoji = '🟢';
  } else if (healthPercentage >= 70) {
    overallStatus = 'GOOD';
    statusEmoji = '🟡';
  } else if (healthPercentage >= 50) {
    overallStatus = 'FAIR';
    statusEmoji = '🟠';
  } else {
    overallStatus = 'POOR';
    statusEmoji = '🔴';
  }
  
  console.log(`${statusEmoji} Overall Status: ${overallStatus}`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (healthPercentage < 100) {
    console.log('• Address missing files or dependencies above');
  }
  if (!hasServer) {
    console.log('• Start a development server to enable full functionality');
  }
  if (healthPercentage >= 90) {
    console.log('• Use comprehensive-health-check.html for detailed browser testing');
    console.log('• Run startup-check.js for detailed file system diagnostics');
  }
  
  console.log('\n🔧 QUICK ACTIONS:');
  console.log('• Health Check: node startup-check.js');
  console.log('• Browser Test: Open comprehensive-health-check.html');
  console.log('• Start Server: npm run dev (or use standalone config)');
  
  return {
    timestamp,
    healthScore,
    maxScore,
    healthPercentage,
    hasServer,
    overallStatus
  };
}

// Run the availability check
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await generateAvailabilityReport();
  } catch (error) {
    console.error('\n❌ Error during availability check:', error.message);
    process.exit(1);
  }
}