'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../styles/leaderboard.css';

export default function LeaderboardPage() {
  const { socket, connected } = useSocket();
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeFilter, setTimeFilter] = useState('session');
  const [sessionId, setSessionId] = useState(null);

  const timeFilterOptions = [
    { value: 'session', label: '🔴 Live' },
    { value: 'daily', label: '📅 Today' },
    { value: 'weekly', label: '📊 Week' },
    { value: 'monthly', label: '📈 Month' },
    { value: 'yearly', label: '📗 Year' },
    { value: 'all-time', label: '🏆 All-Time' }
  ];

  useEffect(() => {
    if (!socket) return;

    // Listen for session ID updates
    const handleSessionSet = (data) => {
      console.log('📌 Session ID received:', data.sessionId);
      setSessionId(data.sessionId);
    };

    socket.on('session-set', handleSessionSet);

    return () => {
      socket.off('session-set', handleSessionSet);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    // Skip if session filter but no sessionId yet
    if (timeFilter === 'session' && !sessionId) {
      console.log('⏳ Waiting for sessionId before fetching session leaderboard');
      return;
    }

    // Clear leaderboard when filter changes
    setLeaderboard([]);

    // Listen for leaderboard updates with time filter
    const handleLeaderboardUpdate = (data) => {
      // console.log('📈 Leaderboard updated:', data);
      setLeaderboard(data);
    };

    socket.on('leaderboard-update', handleLeaderboardUpdate);

    // Request initial leaderboard
    console.log(`📊 Requesting leaderboard for ${timeFilter}`);
    socket.emit('request-leaderboard', { timeFilter, sessionId });

    // Setup periodic update every 5 seconds
    const updateInterval = setInterval(() => {
      console.log(`📊 Auto-updating leaderboard for ${timeFilter}`);
      socket.emit('request-leaderboard', { timeFilter, sessionId });
    }, 5000);

    return () => {
      socket.off('leaderboard-update', handleLeaderboardUpdate);
      clearInterval(updateInterval);
    };
  }, [socket, timeFilter, sessionId]);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p className="status">
          {connected ? '✅ Connected' : '❌ Disconnected'}
        </p>
      </div>

      <div className="filter-buttons">
        {timeFilterOptions.map(option => (
          <button
            key={option.value}
            className={`filter-btn ${timeFilter === option.value ? 'active' : ''}`}
            onClick={() => {
              setLeaderboard([]);
              setTimeFilter(option.value);
              // Broadcast filter change to all connected clients
              if (socket) {
                socket.emit('filter-changed', { timeFilter: option.value });
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="leaderboard-content">
        {leaderboard && leaderboard.length > 0 ? (
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="col-rank">Rank</div>
              <div className="col-name">Player</div>
              <div className="col-points">Points</div>
              <div className="col-count">Questions</div>
            </div>
            <div className="table-body">
              {leaderboard.map((player, index) => (
                <div key={player._id || index} className={`table-row rank-${index + 1}`}>
                  <div className="col-rank">
                    <span className="rank-badge">#{index + 1}</span>
                  </div>
                  <div className="col-name">{player.nickname}</div>
                  <div className="col-points">
                    <span className="points-value">{player.totalPoints}</span>
                    <span className="points-icon">⭐</span>
                  </div>
                  <div className="col-count">{player.count || 0}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No leaderboard data yet</p>
            <p className="sub-text">Players will appear here as they answer questions</p>
          </div>
        )}
      </div>

      <div className="leaderboard-footer">
        <p>Real-time leaderboard • Updated every 5 seconds</p>
      </div>
    </div>
  );
}
