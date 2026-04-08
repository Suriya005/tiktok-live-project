'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import * as api from '../services/api';
import '../styles/overlay.css';

export default function AdminPanel({ sessionId, setSessionId, onReady }) {
  const { socket, connected } = useSocket();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionData, setSelectedQuestionData] = useState(null);
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [timeFilter, setTimeFilter] = useState('session');
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    tags: [],
    difficulties: []
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [searchParticipants, setSearchParticipants] = useState('');
  const [showQuestionOptions, setShowQuestionOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [showQuestionsList, setShowQuestionsList] = useState(false);

  // Helper function to show notification
  const showNotification = (message, type = 'info', duration = 2000) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Load questions on mount
  useEffect(() => {
    const initializePanel = async () => {
      await Promise.all([loadQuestions(), loadFilterOptions()]);
      setIsInitialized(true);
      if (onReady) {
        onReady();
      }
    };
    initializePanel();
  }, [onReady]);

  const loadFilterOptions = async () => {
    try {
      const data = await api.getFilterOptions();
      setFilterOptions({
        categories: data.data?.categories || [],
        tags: data.data?.tags || [],
        difficulties: data.data?.difficulties || []
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setFilterCategory(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    if (filterCategory.length === filterOptions.categories.length) {
      // If all selected, deselect all
      setFilterCategory([]);
    } else {
      // Otherwise select all
      setFilterCategory([...filterOptions.categories]);
    }
  };

  // Load participants
  const loadParticipants = async () => {
    try {
      const data = await api.getParticipants(sessionId);
      setParticipants(data.data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  // Refresh participants every 3 seconds when question is active
  useEffect(() => {
    if (!selectedQuestion) return;
    
    loadParticipants();
    const interval = setInterval(loadParticipants, 3000);
    return () => clearInterval(interval);
  }, [selectedQuestion, sessionId]);

  // Listen for TikTok connection/disconnection events
  useEffect(() => {
    if (!socket) return;

    socket.on('tiktok-connected', (data) => {
      console.log('✅ TikTok Live connected:', data);
      setTiktokConnected(true);
    });

    socket.on('tiktok-disconnected', (data) => {
      console.log('❌ TikTok Live disconnected:', data);
      setTiktokConnected(false);
      setSelectedQuestion(null);
      showNotification('❌ TikTok Live disconnected', 'warning');
    });

    return () => {
      socket.off('tiktok-connected');
      socket.off('tiktok-disconnected');
    };
  }, [socket]);

  // Update leaderboard every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await api.getLeaderboard(timeFilter, sessionId);
        setLeaderboard(data.data || []);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, timeFilter]);

  const loadQuestions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const filters = {
        search: searchText,
        category: filterCategory,
        tags: filterTag ? [filterTag] : [],
        difficulty: filterDifficulty || null,
        page,
        limit: 20
      };
      
      const data = await api.getQuestions(filters);
      setQuestions(data.data || []);

      // Update pagination info
      if (data.pagination) {
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setPaginationInfo(data.pagination);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, filterCategory, filterTag, filterDifficulty]);

  // Reload questions when filters change
  useEffect(() => {
    if (isInitialized) {
      setCurrentPage(1);
      loadQuestions(1);
    }
  }, [searchText, filterCategory, filterTag, filterDifficulty, isInitialized, loadQuestions]);


  const handleStartQuestion = async (questionId) => {
    try {
      setLoading(true);
      setSelectedQuestion(questionId);
      // Store the question data
      const questionData = questions.find(q => q._id === questionId);
      if (questionData) {
        setSelectedQuestionData(questionData);
      }
      await api.startQuestion(questionId);
      // Reset hint progress on frontend
      if (socket) {
        socket.emit('monitor-hint');
        // Emit reset to ensure overlay resets
        socket.emit('reset-hint-progress');
      }
      showNotification('▶️ Question started!', 'success', 1500);
    } catch (error) {
      console.error('Error starting question:', error);
      showNotification(`❌ Failed to start question: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipQuestion = async () => {
    try {
      setLoading(true);
      await api.skipQuestion();
      setSelectedQuestion(null);
      showNotification('⏭️ Question skipped!', 'success', 1500);
    } catch (error) {
      console.error('Error skipping question:', error);
      showNotification(`❌ Failed to skip question: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetWinner = async (tiktokId, nickname) => {
    try {
      setLoading(true);
      const data = await api.setWinnerManually(tiktokId, nickname, sessionId);
      showNotification(`✅ ${nickname} marked as winner! +${data.data?.points} points`, 'success', 2000);
      setSelectedQuestion(null);
      setShowParticipantsList(false);
    } catch (error) {
      console.error('Error setting winner:', error);
      showNotification(`❌ Failed to set winner: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTimeFilter = (newFilter) => {
    setTimeFilter(newFilter);
    if (socket && connected) {
      socket.emit('filter-changed', { timeFilter: newFilter });
      showNotification(`📊 Filter changed to: ${newFilter}`, 'info', 1500);
    }
  };

  const handleConnectTikTok = async () => {
    if (!tiktokUsername.trim()) {
      showNotification('⚠️ Please enter TikTok username', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (socket && connected) {
        // Generate new session ID on connect
        const newSessionId = `session_${Date.now()}`;
        setSessionId(newSessionId);
        
        socket.emit('connect-tiktok', { username: tiktokUsername });
        socket.on('tiktok-connection-result', (result) => {
          if (result.success) {
            setTiktokConnected(true);
            showNotification('✅ Connected to TikTok Live!', 'success');
            // Set session ID after connection
            socket.emit('set-session', { sessionId: newSessionId });
          } else {
            showNotification(`❌ Failed to connect to TikTok: ${result.error}`, 'error');
          }
        });
      }
    } catch (error) {
      console.error('Error connecting to TikTok:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectTikTok = () => {
    if (socket && connected) {
      socket.emit('disconnect-tiktok');
      setTiktokConnected(false);
    }
  };

  const handleSearchQuestions = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      
      const filters = {
        search: searchText,
        category: filterCategory,
        tags: filterTag ? [filterTag] : [],
        difficulty: filterDifficulty || null,
        page: 1,
        limit: 20
      };
      
      const data = await api.getQuestions(filters);
      setQuestions(data.data || []);

      if (data.pagination) {
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setPaginationInfo(data.pagination);
      }
      
      showNotification('🔍 Search updated!', 'info', 1500);
    } catch (error) {
      console.error('Error during search:', error);
      showNotification('❌ Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomQuestion = async () => {
    try {
      setLoading(true);
      
      // Build filters from current state
      const filters = {
        search: searchText,
        category: filterCategory,
        tags: filterTag ? [filterTag] : [],
        difficulty: filterDifficulty || null
      };
      
      // Get random question matching filters from API
      const data = await api.getRandomQuestion(filters);
      
      if (!data.data) {
        showNotification('⚠️ No questions match your filters', 'warning');
        setLoading(false);
        return;
      }

      setSelectedQuestion(data.data._id);
      setSelectedQuestionData(data.data);
      await api.startQuestion(data.data._id);
      if (socket) {
        socket.emit('monitor-hint');
        socket.emit('reset-hint-progress');
      }
      showNotification('🎲 Random question displayed!', 'success', 1500);
    } catch (error) {
      console.error('Error getting random question:', error);
      
      // Check if 404 (no questions found)
      if (error.response?.status === 404) {
        showNotification('⚠️ ไม่พบคำถาม', 'warning');
      } else {
        showNotification(`❌ Failed to get random question: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
       
      {!tiktokConnected && selectedQuestion && (
        <div className="admin-panel" style={{ 
          margin: 0, 
          position: 'relative', 
          maxHeight: 'none',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: '2px solid #ff0000',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <div style={{ fontSize: '1.5rem', color: '#ff6b6b', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            TikTok Live Disconnected
          </div>
          <div style={{ color: '#aaa', marginBottom: '1rem' }}>
            The connection to TikTok Live has been lost. Please reconnect.
          </div>
          <button 
            className="button"
            onClick={() => {
              setSelectedQuestion(null);
              setTiktokUsername('');
            }}
            style={{ marginTop: '1rem' }}
          >
            ← Back to Connection
          </button>
        </div>
      )}

      <div className="admin-panel" style={{ margin: 0, position: 'relative', maxHeight: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="panel-title" style={{ margin: 0 }}>🎮 Admin Panel</div>
          <button
            onClick={() => window.location.href = 'http://192.168.1.2:3000/'}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c63ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5a52d5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6c63ff'}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* TikTok Connection */}
        <div className="panel-section">
          <div className="section-label">🎬 TikTok Connection</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="TikTok username"
              value={tiktokUsername}
              onChange={(e) => setTiktokUsername(e.target.value)}
              disabled={loading || tiktokConnected}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button
              className={`button ${tiktokConnected ? 'danger' : ''}`}
              onClick={tiktokConnected ? handleDisconnectTikTok : handleConnectTikTok}
              disabled={loading}
              style={{ flex: 0.5, marginBottom: 0 }}
            >
              {tiktokConnected ? '❌' : '✅'}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: tiktokConnected ? '#00ff00' : '#ff0000' }}>
            {tiktokConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>

        {/* Display Question with Search and Filters */}
        <div className="panel-section">
          <div className="section-label">🔍 📺 Search & Display Question</div>
          
          {/* Search Input */}
          <input
            type="text"
            className="input-field"
            placeholder="Search questions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={loading}
            style={{ marginBottom: '0.75rem' }}
          />

          {/* Category Filter - Multi-Select */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#00ffff', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              📁 Categories ({filterCategory.length}/{filterOptions.categories.length})
            </div>
            {/* Select All */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
              backgroundColor: filterCategory.length === filterOptions.categories.length && filterOptions.categories.length > 0 ? 'rgba(255, 200, 0, 0.15)' : 'rgba(100, 100, 100, 0.1)',
              border: `1px solid ${filterCategory.length === filterOptions.categories.length && filterOptions.categories.length > 0 ? '#ffc800' : 'rgba(100, 100, 100, 0.3)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: filterCategory.length === filterOptions.categories.length && filterOptions.categories.length > 0 ? '#ffc800' : '#999',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              <input
                type="checkbox"
                checked={filterCategory.length === filterOptions.categories.length && filterOptions.categories.length > 0}
                onChange={toggleAllCategories}
                disabled={loading}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem' }}>Select All</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {filterOptions.categories.map(cat => (
                <label key={cat} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: filterCategory.includes(cat) ? 'rgba(0, 255, 255, 0.15)' : 'rgba(100, 100, 100, 0.1)',
                  border: `1px solid ${filterCategory.includes(cat) ? '#00ffff' : 'rgba(100, 100, 100, 0.3)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: filterCategory.includes(cat) ? '#00ffff' : '#999'
                }}>
                  <input
                    type="checkbox"
                    checked={filterCategory.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    disabled={loading}
                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.8rem' }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div style={{ marginBottom: '0.75rem' }}>
            <select
              className="input-field"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              disabled={loading}
              style={{ marginBottom: 0 }}
            >
              <option value="">ความยากทั้งหมด ({filterOptions.difficulties.length})</option>
              {filterOptions.difficulties.map(diff => (
                <option key={diff} value={diff}>ระดับความยาก {diff}</option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <select
            className="input-field"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            disabled={loading}
            style={{ marginBottom: '0.75rem' }}
          >
            <option value="">All Tags ({filterOptions.tags.length})</option>
            {filterOptions.tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Search and Random Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              className="button"
              onClick={handleSearchQuestions}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#00ffff',
                color: '#000',
                padding: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              🔍 Search
            </button>
            <button
              className="button"
              onClick={handleRandomQuestion}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#ff6b9d',
                padding: '0.75rem'
              }}
            >
              🎲 Random
            </button>
          </div>

          {/* Questions List */}
          <div 
            className="section-label" 
            style={{ cursor: 'pointer', marginBottom: '0.75rem' }} 
            onClick={() => setShowQuestionsList(!showQuestionsList)}
          >
            📋 Questions List {showQuestionsList ? '▼' : '▶'}
          </div>
          {showQuestionsList && (
            <>
          <div className="section-content" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {questions.map(q => (
                <div
                  key={q._id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    backgroundColor: selectedQuestion === q._id ? 'rgba(0, 255, 255, 0.2)' : 'transparent'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#00ffff', marginBottom: '0.25rem' }}>
                    {q.text.substring(0, 75)}...
                  </div>
                  
                  {q.tags && q.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      {q.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '0.6rem', backgroundColor: '#003366', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: '#999', marginBottom: '0.25rem' }}>
                    📊 D{q.difficulty} · {q.points}pts
                  </div>
                  <button
                    className="button"
                    onClick={() => handleStartQuestion(q._id)}
                    disabled={loading}
                    style={{ padding: '0.5rem', fontSize: '0.75rem', marginBottom: 0, width: '100%' }}
                  >
                    ▶️ Display
                  </button>
                </div>
              ))}
            {questions.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '1rem', fontSize: '0.8rem' }}>
                No questions found
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem',
              padding: '0.5rem',
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#00ffff'
            }}>
              <button
                onClick={() => loadQuestions(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                style={{
                  padding: '0.4rem 0.6rem',
                  backgroundColor: currentPage === 1 ? '#333' : '#00ffff',
                  color: currentPage === 1 ? '#666' : '#000',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              >
                ← Previous
              </button>
              <span>Page {currentPage} / {totalPages}{paginationInfo ? ` (${paginationInfo.total} total)` : ''}</span>
              <button
                onClick={() => loadQuestions(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                style={{
                  padding: '0.4rem 0.6rem',
                  backgroundColor: currentPage === totalPages ? '#333' : '#00ffff',
                  color: currentPage === totalPages ? '#666' : '#000',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              >
                Next →
              </button>
            </div>
          )}

          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.5rem' }}>
            💡 <a href="/questions" style={{ color: '#00ffff', textDecoration: 'none' }}>/questions</a> for full CRUD
          </div>
            </>
          )}
        </div>

        {/* Current Answer Display */}
        {selectedQuestion && (
          <div className="panel-section" style={{ backgroundColor: '#001a00', borderLeft: '3px solid #00ff00' }}>
            <div className="section-label">📝 Current Answer</div>
            {(selectedQuestionData || questions.find(q => q._id === selectedQuestion)) && (
              <div>
                <div style={{
                  backgroundColor: '#003300',
                  padding: '1rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>
                    {(selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.text}
                  </div>
                  <div style={{ fontSize: '1.8rem', color: '#00ff00', fontWeight: 'bold', letterSpacing: '2px' }}>
                    ✅ {(selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.answer}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#00cc00', marginTop: '0.5rem' }}>
                    Hint: {(selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.hint || 'N/A'}
                  </div>
                </div>

                {/* Options Display */}
                {(selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.options && (selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.options.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowQuestionOptions(!showQuestionOptions)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        marginTop: '0.5rem',
                        backgroundColor: showQuestionOptions ? '#00ff00' : 'rgba(0, 255, 0, 0.2)',
                        color: showQuestionOptions ? '#000' : '#00ff00',
                        border: `1px solid ${showQuestionOptions ? '#00ff00' : 'rgba(0, 255, 0, 0.5)'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {showQuestionOptions ? '▼ Hide Options' : '▶ Show Options'}
                    </button>

                    {showQuestionOptions && (
                      <div style={{
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
                        border: '1px solid rgba(0, 255, 0, 0.3)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#00ff00', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          📋 Options ({(selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.options.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(selectedQuestionData || questions.find(q => q._id === selectedQuestion))?.options.map((option, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(0, 255, 0, 0.3)',
                                borderRadius: '4px',
                                padding: '0.5rem',
                                fontSize: '0.8rem',
                                color: '#00ff00'
                              }}
                            >
                              <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Participants - Manual Winner Selection */}
        {selectedQuestion && (
          <div className="panel-section" style={{ backgroundColor: '#1a0a1a', borderLeft: '3px solid #ffb6d9' }}>
            <div 
              className="section-label" 
              style={{ cursor: 'pointer' }} 
              onClick={() => {
                setShowParticipantsList(!showParticipantsList);
                setSearchParticipants(''); // Clear search when toggling
              }}
            >
              👥 Participants ({participants.length}) {showParticipantsList ? '▼' : '▶'}
            </div>
            {showParticipantsList && (
              <div>
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchParticipants}
                  onChange={(e) => setSearchParticipants(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 182, 217, 0.3)',
                    borderRadius: '4px',
                    color: '#ffb6d9',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ffb6d9';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 182, 217, 0.3)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                  }}
                />
                
                {/* Participants List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {participants
                    .filter(user =>
                      user.nickname.toLowerCase().includes(searchParticipants.toLowerCase())
                    )
                    .length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '1rem', fontSize: '0.8rem' }}>
                      {searchParticipants ? 'No participants match search' : 'No participants yet'}
                    </div>
                  ) : (
                    participants
                      .filter(user =>
                        user.nickname.toLowerCase().includes(searchParticipants.toLowerCase())
                      )
                      .map((user, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSetWinner(user._id, user.nickname)}
                          style={{
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'rgba(255, 182, 217, 0.1)',
                            border: '1px solid rgba(255, 182, 217, 0.3)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: '#ffb6d9'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 182, 217, 0.2)';
                            e.currentTarget.style.borderColor = '#ffb6d9';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 182, 217, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 182, 217, 0.3)';
                          }}
                        >
                          <div style={{ fontSize: '0.8rem' }}>
                            <div>{user.nickname}</div>
                            <div style={{ fontSize: '0.65rem', color: '#999' }}>ID: {user._id.substring(0, 8)}...</div>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: 'rgba(255, 182, 217, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
                            {user.totalPoints} pts
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Control */}
        {selectedQuestion && (
          <div className="panel-section">
            <div className="section-label">🎮 Quiz Control</div>
            <button
              className="button danger"
              onClick={handleSkipQuestion}
              disabled={loading}
            >
              Skip Question
            </button>
          </div>
        )}

        {/* Leaderboard */}
        <div className="panel-section">
          <div className="section-label">🏆 Leaderboard</div>
          
          {/* Time Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['session', 'today', 'all-time'].map(filter => (
              <button
                key={filter}
                onClick={() => handleChangeTimeFilter(filter)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: timeFilter === filter ? '#00ffff' : 'rgba(0, 255, 255, 0.2)',
                  color: timeFilter === filter ? '#000' : '#00ffff',
                  border: `1px solid ${timeFilter === filter ? '#00ffff' : 'rgba(0, 255, 255, 0.5)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize'
                }}
                disabled={loading}
              >
                {filter.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          <div className="section-content">
            {leaderboard.slice(0, 10).map((user, idx) => (
              <div key={idx} className="leaderboard-row">
                <span className="rank">#{idx + 1}</span>
                <span className="username">{user.nickname}</span>
                <span className="points">{user.totalPoints}</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
                No participants yet
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="panel-section" style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
          <div>Session: {sessionId.slice(0, 12)}...</div>
          <div style={{ color: connected ? '#00ff00' : '#ff0000' }}>
            {connected ? '✅ Socket Connected' : '❌ Socket Disconnected'}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            backgroundColor: notification.type === 'success' ? '#10b981' : 
                             notification.type === 'error' ? '#ef4444' :
                             notification.type === 'warning' ? '#f59e0b' : '#3b82f6',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}
        >
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
