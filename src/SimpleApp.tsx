import React from 'react';

export default function SimpleApp() {
  console.log("SimpleApp rendering...");
  
  React.useEffect(() => {
    console.log("SimpleApp mounted!");
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green' }}>READY - Simple App Works</h1>
      <p>This is a minimal test app to verify basic React functionality.</p>
      <button onClick={() => alert('Click works!')}>Test Click</button>
    </div>
  );
}