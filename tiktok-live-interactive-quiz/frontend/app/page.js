'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './styles/home.css';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      fontFamily: 'courier new, monospace',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#00ffff', marginBottom: '0.5rem', textShadow: '0 0 20px #00ffff' }}>
          🎮 TikTok Live Quiz
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '2rem' }}>
          Real-time Interactive Quiz System
        </p>
      </div>

      {/* Main Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        width: '100%',
        marginBottom: '2rem'
      }}>
        {/* Overlay Card */}
        <div style={{
          backgroundColor: '#1a1f3a',
          border: '2px solid #00ffff',
          borderRadius: '12px',
          padding: '2rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
          e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onClick={() => router.push('/overlay')}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
          <h2 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>Overlay Display</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Real-time question display with hints, winners, and gift notifications
          </p>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#00ffff',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Open Overlay →
          </button>
        </div>

        {/* Admin Panel Card */}
        <div style={{
          backgroundColor: '#1a1f3a',
          border: '2px solid #ffaa00',
          borderRadius: '12px',
          padding: '2rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(255, 170, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 170, 0, 0.6)';
          e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onClick={() => router.push('/admin')}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h2 style={{ color: '#ffaa00', marginBottom: '0.5rem' }}>Admin Panel</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Connect to TikTok, control quiz flow, view leaderboard, and more
          </p>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#ffaa00',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Open Admin →
          </button>
        </div>

        {/* Questions Manager Card */}
        <div style={{
          backgroundColor: '#1a1f3a',
          border: '2px solid #00ff00',
          borderRadius: '12px',
          padding: '2rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 0, 0.6)';
          e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onClick={() => router.push('/questions')}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h2 style={{ color: '#00ff00', marginBottom: '0.5rem' }}>Question Manager</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Create, edit, delete questions with full CRUD operations and live preview
          </p>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Open Manager →
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>Full CRUD</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Create, read, update, and delete questions easily</p>
        </div>

        <div style={{ backgroundColor: 'rgba(255, 170, 0, 0.1)', border: '1px solid #ffaa00', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
          <h3 style={{ color: '#ffaa00', marginBottom: '0.5rem' }}>Tags & Filters</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Organize questions with tags and categories</p>
        </div>

        <div style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid #00ff00', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h3 style={{ color: '#00ff00', marginBottom: '0.5rem' }}>Statistics</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>View stats by category, difficulty, and tags</p>
        </div>

        <div style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎲</div>
          <h3 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>Random Selection</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Get random questions or filter by tags</p>
        </div>

        <div style={{ backgroundColor: 'rgba(255, 170, 0, 0.1)', border: '1px solid #ffaa00', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎬</div>
          <h3 style={{ color: '#ffaa00', marginBottom: '0.5rem' }}>TikTok Live</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Connect to TikTok Live for real-time events</p>
        </div>

        <div style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid #00ff00', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
          <h3 style={{ color: '#00ff00', marginBottom: '0.5rem' }}>Leaderboard</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Real-time leaderboard with scoring system</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
        <p>🎮 TikTok Live Interactive Quiz v1.0</p>
      </div>
    </div>
  );
}
