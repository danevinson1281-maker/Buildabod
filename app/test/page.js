'use client';
import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ background: '#000', color: '#fff', padding: '40px', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Hydration Test</h1>
      <p style={{ marginBottom: '20px' }}>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)} 
        style={{ 
          background: '#FFD700', 
          color: '#000', 
          padding: '16px 32px', 
          borderRadius: '8px', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          border: 'none', 
          cursor: 'pointer' 
        }}
      >
        TAP ME
      </button>
    </div>
  );
}
