'use client';

import { useState, useEffect } from 'react';
import Overlay from '../components/Overlay';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  const [sessionId, setSessionId] = useState(() => {
    return `session_${Date.now()}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [adminReady, setAdminReady] = useState(false);
  const [overlayReady, setOverlayReady] = useState(false);

  // Mark both components as ready
  useEffect(() => {
    if (adminReady && overlayReady) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [adminReady, overlayReady]);

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      gap: 0,
      position: 'relative'
    }}>
      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0e27',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: '2rem'
        }}>
          {/* Spinner */}
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(0, 255, 255, 0.2)',
            borderTop: '4px solid #00ffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          
          {/* Loading Text */}
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              color: '#00ffff',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              fontFamily: 'monospace'
            }}>
              🎮 Initializing Admin Panel
            </div>
            <div style={{
              color: '#888',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}>
              Loading components and data...
            </div>
          </div>

          {/* Status Indicators */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: adminReady ? 'rgba(0, 255, 0, 0.1)' : 'rgba(200, 200, 200, 0.1)',
              border: `1px solid ${adminReady ? '#00ff00' : '#666'}`,
              borderRadius: '4px',
              color: adminReady ? '#00ff00' : '#888',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {adminReady ? '✅ Admin Panel' : '⏳ Admin Panel'}
            </div>
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: overlayReady ? 'rgba(0, 255, 0, 0.1)' : 'rgba(200, 200, 200, 0.1)',
              border: `1px solid ${overlayReady ? '#00ff00' : '#666'}`,
              borderRadius: '4px',
              color: overlayReady ? '#00ff00' : '#888',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {overlayReady ? '✅ Overlay' : '⏳ Overlay'}
            </div>
          </div>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Left: Admin Panel */}
      <div style={{
        width: '700px',
        backgroundColor: '#0a0e27',
        borderRight: '1px solid rgba(0, 255, 255, 0.2)',
        overflowY: 'auto',
        padding: '1rem',
        fontFamily: 'monospace',
        color: '#fff',
        position: 'relative',
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
        transition: 'opacity 0.3s ease'
      }}>
        <AdminPanel 
          sessionId={sessionId} 
          setSessionId={setSessionId}
          onReady={() => setAdminReady(true)}
        />
      </div>

      {/* Right: Overlay Display */}
      <div style={{
        flex: 1,
        minWidth: 0,
        overflowY: 'auto',
        backgroundColor: '#000',
        position: 'relative',
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
        transition: 'opacity 0.3s ease'
      }}>
        <Overlay 
          sessionId={sessionId}
          onReady={() => setOverlayReady(true)}
        />
      </div>
    </div>
  );
}
