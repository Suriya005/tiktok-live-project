'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../styles/leaderboard-overlay.css';

export default function LeaderboardOverlayPage() {
  const { socket, connected } = useSocket();
  const [leaderboard, setLeaderboard] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [timeFilter, setTimeFilter] = useState('session');

  // Listen for session ID updates
  useEffect(() => {
    if (!socket) return;

    const handleSessionSet = (data) => {
      console.log('📌 Session ID received (overlay):', data.sessionId);
      setSessionId(data.sessionId);
    };

    socket.on('session-set', handleSessionSet);

    // Also request current sessionId on mount
    socket.emit('get-current-session');

    return () => {
      socket.off('session-set', handleSessionSet);
    };
  }, [socket]);

  // Listen for filter changes from leaderboard page
  useEffect(() => {
    if (!socket) return;

    const handleFilterChanged = (data) => {
      console.log('🔄 Filter changed (overlay):', data.timeFilter);
      setTimeFilter(data.timeFilter);
    };

    socket.on('filter-changed', handleFilterChanged);

    return () => {
      socket.off('filter-changed', handleFilterChanged);
    };
  }, [socket]);

  // Fetch leaderboard data
  useEffect(() => {
    if (!socket) {
      console.log('⏳ Waiting for socket connection (overlay)');
      return;
    }

    console.log('📊 Requesting overlay leaderboard, timeFilter:', timeFilter, 'sessionId:', sessionId);
    
    const handleLeaderboardUpdate = (data) => {
      // console.log('📈 Overlay leaderboard updated with', data.length, 'players:', data);
      // Only take top 5
      setLeaderboard(data.slice(0, 5));
    };

    socket.on('leaderboard-update', handleLeaderboardUpdate);

    // Request initial leaderboard
    socket.emit('request-leaderboard', { timeFilter, sessionId });

    // Setup periodic update every 5 seconds
    const updateInterval = setInterval(() => {
      console.log('📊 Auto-updating overlay, timeFilter:', timeFilter, 'sessionId:', sessionId);
      socket.emit('request-leaderboard', { timeFilter, sessionId });
    }, 5000);

    return () => {
      socket.off('leaderboard-update', handleLeaderboardUpdate);
      clearInterval(updateInterval);
    };
  }, [socket, timeFilter, sessionId]);

  return (
    <div className="leaderboard-overlay-container">
      <div className="overlay-content">
        <div className="overlay-title">
          <h2>🏆 Top 5</h2>
        </div>

        {leaderboard && leaderboard.length > 0 ? (
          <div className="overlay-leaderboard">
            {leaderboard.map((player, index) => (
              <div key={player._id || index} className={`overlay-row rank-${index + 1}`}>
                <div className="overlay-rank">#{index + 1}</div>
                <div className="overlay-name">{player.nickname}</div>
                <div className="overlay-points">
                  <span className="overlay-icon">⭐</span>
                  {player.totalPoints}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overlay-empty">
            <p>No data yet</p>
          </div>
        )}

        <div className="overlay-status">
          {connected ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
}
