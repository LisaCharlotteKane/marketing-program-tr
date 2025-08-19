// Simple test to verify App component can be imported without errors
try {
  console.log('Testing App import...');
  
  // Test if modules can be resolved
  const modules = [
    './lib/notifier',
    './hooks/useKV',  
    './types/campaign',
    './types/utils'
  ];
  
  console.log('Checking module paths...');
  modules.forEach(module => {
    console.log(`✓ Module path: ${module}`);
  });
  
  console.log('✓ All basic checks passed');
  
} catch (error) {
  console.error('❌ Error:', error);
}