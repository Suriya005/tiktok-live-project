'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../styles/overlay.css';

export default function Overlay({ sessionId, onReady }) {
  const { socket, connected } = useSocket();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [winner, setWinner] = useState(null);
  const [hint, setHint] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [hintProgress, setHintProgress] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeFilter, setTimeFilter] = useState('session');
  const giftIdCounter = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showQuestionOptions, setShowQuestionOptions] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Start monitoring hint progress
    socket.emit('monitor-hint');
    console.log('📊 Started monitoring hint progress');

    // Listen for question started
    socket.on('question-started', (data) => {
      console.log('📝 Question started:', data);
      setCurrentQuestion(data.question);
      setHint(null);
      setWinner(null);
      setHintProgress(0);
    });

    // Listen for correct answer (winner)
    socket.on('answer-correct', (data) => {
      console.log('🎉 Correct answer:', data);
      setCurrentQuestion(null);
      setWinner(data);
      setHintProgress(0);
      setGifts([]);
      // Setting currentQuestion to null will trigger leaderboard request in the next useEffect
      // Auto-dismiss winner after 5 seconds
      setTimeout(() => setWinner(null), 5000);
    });

    // Listen for hint unlocked
    socket.on('hint-unlocked', (data) => {
      console.log('💡 Hint unlocked:', data);
      setHint(data.hint);
    });

    // Listen for hint status
    socket.on('hint-status', (data) => {
      // console.log('📊 Hint status:', data);
      if (data.progress) {
        const percentage = parseFloat(data.progress.replace('%', ''));
        setHintProgress(percentage);
      }
    });

    // Listen for question skipped
    socket.on('question-skipped', () => {
      console.log('⏭️ Question skipped');
      setCurrentQuestion(null);
      setHint(null);
      setWinner(null);
      setHintProgress(0);
    });

    // Listen for hint progress reset
    socket.on('reset-hint-progress', () => {
      console.log('🔄 Resetting hint progress');
      setHintProgress(0);
      setGifts([]);
    });

    // Listen for TikTok connection
    socket.on('tiktok-connected', (data) => {
      console.log('✅ TikTok connected:', data);
      // Reset overlay
      setCurrentQuestion(null);
      setWinner(null);
      setHint(null);
      setHintProgress(0);
      setGifts([]);
    });

    // Listen for TikTok disconnection
    socket.on('tiktok-disconnected', (data) => {
      console.log('❌ TikTok disconnected:', data);
      // Reset overlay
      setCurrentQuestion(null);
      setWinner(null);
      setHint(null);
      setHintProgress(0);
      setGifts([]);
    });

    // Listen for user gifts
    socket.on('user-gift', (data) => {
      console.log('🎁 Gift received:', data);
      console.log(`📊 @${data.nickname} current score: ${data.totalCoins} coins`);
      const giftId = ++giftIdCounter.current;
      setGifts(prev => [{ ...data, id: giftId }, ...prev.slice(0, 4)]);
      setTimeout(() => {
        console.log('🗑️ Removing gift notification:', giftId);
        setGifts(prev => prev.filter(g => g.id !== giftId));
      }, 5000);
    });

    // Listen for leaderboard updates
    socket.on('leaderboard-update', (data) => {
      // console.log('📈 Leaderboard updated:', data);
      setLeaderboard(data);
    });

    // Listen for filter changes from admin panel
    socket.on('filter-changed', (data) => {
      setTimeFilter(data.timeFilter);
    });

    return () => {
      socket.off('question-started');
      socket.off('answer-correct');
      socket.off('hint-unlocked');
      socket.off('hint-status');
      socket.off('question-skipped');
      socket.off('user-gift');
      socket.off('reset-hint-progress');
      socket.off('tiktok-connected');
      socket.off('tiktok-disconnected');
      socket.off('leaderboard-update');
      socket.off('filter-changed');
    };
  }, [socket]);

  // Initialize and request leaderboard when socket ready
  useEffect(() => {
    if (!socket || !connected || !sessionId) return;

    // Mark as initialized
    if (!isInitialized) {
      socket.emit('request-leaderboard', { timeFilter, sessionId });
      setIsInitialized(true);
      if (onReady) {
        onReady();
      }
    }
  }, [socket, connected, sessionId, onReady, isInitialized]);

  // Request leaderboard when no question is displayed
  useEffect(() => {
    if (!socket || !connected || !sessionId) return;

    // Request leaderboard immediately when currentQuestion is empty
    if (!currentQuestion) {
      socket.emit('request-leaderboard', { timeFilter, sessionId });

      // Setup periodic update every 5 seconds while no question
      const interval = setInterval(() => {
        socket.emit('request-leaderboard', { timeFilter, sessionId });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [socket, currentQuestion, connected, sessionId, timeFilter]);

  // Determine current display state based on currentQuestion and winner
  const displayState = winner ? 'winner' : currentQuestion ? 'question' : 'leaderboard';

  return (
    <div className="overlay-container">
      {/* Connection Status */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10001 }}>
        <span style={{
          color: connected ? '#00ff00' : '#ff0000',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      {/* 
        currentQuestion State Manager: 3 display states
        - 'question': Show question card (currentQuestion exists && no winner)
        - 'winner': Show winner card (winner exists)
        - 'leaderboard': Show leaderboard (no currentQuestion && no winner)
      */}

      {/* State 1: QUESTION - Display quiz question with hint progress */}
      {displayState === 'question' && (
        <div className="question-card">
          <span className="question-category">{currentQuestion.category}</span>
          <div className="question-text">{currentQuestion.text}</div>

          <div className="question-meta">
            <div className="meta-item">
              <span className="meta-label">คะแนน</span>
              <span className="meta-value">{currentQuestion.points} 🏆</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">คำใบ้</span>
              <span className="meta-value">{currentQuestion.requiredCoins} 💎</span>
            </div>
          </div>

          {/* Options Display */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={() => setShowQuestionOptions(!showQuestionOptions)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.75rem',
                  backgroundColor: showQuestionOptions ? '#00ffff' : 'rgba(0, 255, 255, 0.2)',
                  color: showQuestionOptions ? '#000' : '#00ffff',
                  border: `1px solid ${showQuestionOptions ? '#00ffff' : 'rgba(0, 255, 255, 0.5)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {showQuestionOptions ? '▼ ซ่อนตัวเลือก' : '▶ แสดงตัวเลือกคำตอบ'}
              </button>

              {showQuestionOptions && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(0, 255, 255, 0.2)',
                        border: '1px solid rgba(0, 255, 255, 0.4)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        fontSize: '0.85rem',
                        color: '#00ffff',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}
                    >
                      <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Coin Progress */}
          <div className="coin-progress">
            <div className="progress-label">💎 Gift Coins Progress</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(hintProgress, 100)}%` }}
              >
                {Math.round(hintProgress)}%
              </div>
            </div>
          </div>

          {/* Hint */}
          {hint && (
            <div className="hint-box">
              <div className="hint-label">💡 คำใบ้ปลดล็อก!</div>
              <div className="hint-text">{hint}</div>
            </div>
          )}
        </div>
      )}

      {/* State 2: WINNER - Display winner card with name and points */}
      {displayState === 'winner' && (
        <div className="winner-card">
          <div className="winner-emoji">🎉</div>
          <div className="winner-content">
            <div className="winner-text">{winner.nickname}</div>
            <div className="winner-points">+{winner.points} Points!</div>
          </div>
        </div>
      )}

      {/* Gift Notifications (overlay on any state) */}
      {gifts.map(gift => (
        <div key={gift.id} className="gift-notification">
          <div className="gift-user">🎁 {gift.nickname}</div>
          <div className="gift-info">
            Sent {gift.count}x {gift.giftName}
            <br />
            {/* gift pre question */}
            {gift.coinValue} Coins each 🎁
            <br />
            {gift.totalCoins} Coins
          </div>
        </div>
      ))}

      {/* State 3: LEADERBOARD - Display top players ranking */}
      {displayState === 'leaderboard' && (
        <div className="leaderboard-card">
          <div className="leaderboard-title">🏆 Top Players</div>
          <div className="leaderboard-list">
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((player, index) => (
                <div key={player._id || index} className={`leaderboard-item rank-${index + 1}`}>
                  <div className="leaderboard-rank">#{index + 1}</div>
                  <div className="leaderboard-name">{player.nickname}</div>
                  <div className="leaderboard-points">
                    <span className="leaderboard-icon">⭐</span>
                    {player.totalPoints}
                  </div>
                </div>
              ))
            ) : (
              // Empty skeleton rows
              [1, 2, 3, 4, 5].map(index => (
                <div key={`skeleton-${index}`} className="leaderboard-item skeleton">
                  <div className="leaderboard-rank">#{index}</div>
                  <div className="leaderboard-name" style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)', height: '1.2em', borderRadius: '4px', minWidth: '100px' }}></div>
                  <div className="leaderboard-points" style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)', height: '1.2em', borderRadius: '4px', minWidth: '60px' }}></div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
