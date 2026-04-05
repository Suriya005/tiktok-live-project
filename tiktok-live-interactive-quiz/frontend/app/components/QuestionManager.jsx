'use client';

import { useEffect, useState } from 'react';
import * as api from '../services/api';
import '../styles/overlay.css';

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [notification, setNotification] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    answer: '',
    hint: '',
    category: 'general',
    tags: [],
    difficulty: 1,
    points: 10,
    requiredCoins: 100
  });

  // Toast notification helper
  const showNotification = (message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions();
      setQuestions(data.data || []);
      showNotification(`✅ Loaded ${data.data?.length || 0} questions`, 'success', 2000);
    } catch (error) {
      console.error('Error loading questions:', error);
      showNotification('❌ Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.text || !newQuestion.answer) {
      showNotification('⚠️ Question text and answer are required', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await api.updateQuestion(editingId, newQuestion);
        showNotification('✅ Question updated successfully!', 'success');
        setEditingId(null);
      } else {
        await api.createQuestion(newQuestion);
        showNotification('✅ Question created successfully!', 'success');
      }
      resetForm();
      await loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      showNotification(`❌ Failed to save question: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (q) => {
    setNewQuestion(q);
    setEditingId(q._id);
    showNotification('✏️ Editing question - scroll up to see the form', 'info', 2000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        setLoading(true);
        await api.deleteQuestion(id);
        showNotification('✅ Question deleted successfully!', 'success');
        await loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        showNotification(`❌ Failed to delete question: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newQuestion.tags.includes(tagInput)) {
      setNewQuestion({
        ...newQuestion,
        tags: [...newQuestion.tags, tagInput]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setNewQuestion({
      ...newQuestion,
      tags: newQuestion.tags.filter(t => t !== tag)
    });
  };

  const handleLoadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestionStats();
      setStats(data.data);
      setShowStats(true);
      showNotification('📊 Statistics loaded!', 'success', 1000);
    } catch (error) {
      console.error('Error loading stats:', error);
      showNotification(`❌ Failed to load statistics: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRandomQuestion = async () => {
    try {
      setLoading(true);
      const data = await api.getRandomQuestion(filterTag ? [filterTag] : null);
      setNewQuestion(data.data);
      setEditingId(data.data._id);
      showNotification('🎲 Random question loaded!', 'success', 2000);
    } catch (error) {
      console.error('Error getting random question:', error);
      showNotification(`❌ Failed to get random question: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      answer: '',
      hint: '',
      category: 'general',
      tags: [],
      difficulty: 1,
      points: 10,
      requiredCoins: 100
    });
    setTagInput('');
    setEditingId(null);
  };

  const filteredQuestions = questions.filter(q => 
    (!filterCategory || q.category === filterCategory) &&
    (!filterTag || q.tags?.includes(filterTag))
  );

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1 style={{ color: '#00ffff', marginBottom: '2rem', textAlign: 'center' }}>
        📝 Question Manager
      </h1>

      {/* Form */}
      <div style={{
        backgroundColor: '#1a1f3a',
        border: '1px solid #00ccff',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>
          {editingId ? '✏️ Edit Question' : '➕ Create New Question'}
        </h3>

        {/* Category */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Category</label>
          <select
            value={newQuestion.category}
            onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0a0e27',
              color: '#00ffff',
              border: '1px solid #00ccff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="general">General</option>
            <option value="game">Game</option>
            <option value="knowledge">Knowledge</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>

        {/* Question Text */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Question Text</label>
          <textarea
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0a0e27',
              color: '#00ffff',
              border: '1px solid #00ccff',
              borderRadius: '4px',
              minHeight: '80px',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
            placeholder="Enter question text..."
          />
        </div>

        {/* Options */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Options (A, B, C, D)</label>
          {['A', 'B', 'C', 'D'].map((letter, idx) => (
            <input
              key={letter}
              type="text"
              value={newQuestion.options[idx] || ''}
              onChange={(e) => {
                const newOptions = [...newQuestion.options];
                newOptions[idx] = e.target.value;
                setNewQuestion({ ...newQuestion, options: newOptions });
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0e27',
                color: '#00ffff',
                border: '1px solid #00ccff',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                fontFamily: 'monospace'
              }}
              placeholder={`Option ${letter}`}
            />
          ))}
        </div>

        {/* Answer */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Answer (A, B, C, or D)</label>
          <input
            type="text"
            value={newQuestion.answer}
            onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0a0e27',
              color: '#00ffff',
              border: '1px solid #00ccff',
              borderRadius: '4px'
            }}
            placeholder="Answer"
          />
        </div>

        {/* Hint */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Hint</label>
          <input
            type="text"
            value={newQuestion.hint}
            onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0a0e27',
              color: '#00ffff',
              border: '1px solid #00ccff',
              borderRadius: '4px'
            }}
            placeholder="Hint"
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Tags</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#0a0e27',
                color: '#00ffff',
                border: '1px solid #00ccff',
                borderRadius: '4px'
              }}
              placeholder="Add tag (press Enter)"
            />
            <button
              onClick={handleAddTag}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#00ccff',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: loading ? 0.5 : 1
              }}
            >
              Add
            </button>
          </div>
          {newQuestion.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {newQuestion.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#00ccff',
                    color: '#000',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ✕
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty, Points, Coins */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Difficulty (1-5)</label>
            <select
              value={newQuestion.difficulty}
              onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: parseInt(e.target.value) })}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0e27',
                color: '#00ffff',
                border: '1px solid #00ccff',
                borderRadius: '4px'
              }}
            >
              <option value={1}>1 - Easy</option>
              <option value={2}>2 - Normal</option>
              <option value={3}>3 - Hard</option>
              <option value={4}>4 - Very Hard</option>
              <option value={5}>5 - Extreme</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Points</label>
            <input
              type="number"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
              disabled={loading}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0e27',
                color: '#00ffff',
                border: '1px solid #00ccff',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Coins for Hint</label>
            <input
              type="number"
              value={newQuestion.requiredCoins}
              onChange={(e) => setNewQuestion({ ...newQuestion, requiredCoins: parseInt(e.target.value) })}
              disabled={loading}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0e27',
                color: '#00ffff',
                border: '1px solid #00ccff',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleCreateQuestion}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: editingId ? '#ffaa00' : '#00ff00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Saving...' : (editingId ? '💾 Update' : '➕ Create')}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#ff6666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: loading ? 0.5 : 1
              }}
            >
              ❌ Cancel
            </button>
          )}
        </div>
      </div>

      {/* Filters & Tools */}
      <div style={{
        backgroundColor: '#1a1f3a',
        border: '1px solid #00ccff',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>🔍 Filters & Tools</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.75rem',
              backgroundColor: '#0a0e27',
              color: '#00ffff',
              border: '1px solid #00ccff',
              borderRadius: '4px'
            }}
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="game">Game</option>
            <option value="knowledge">Knowledge</option>
            <option value="entertainment">Entertainment</option>
          </select>
          <input
            type="text"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            placeholder="Filter by tag..."
            style={{
              padding: '0.75rem',
              backgroundColor: '#0a0e27',
              color: '#00ffff',
              border: '1px solid #00ccff',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <button
            onClick={handleLoadStats}
            disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: '#00ccff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.5 : 1
            }}
          >
            📊 Statistics
          </button>
          <button
            onClick={handleGetRandomQuestion}
            disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: '#00ccff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.5 : 1
            }}
          >
            🎲 Random
          </button>
          <button
            onClick={resetForm}
            disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: '#00ccff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.5 : 1
            }}
          >
            ➕ New
          </button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <div style={{
          backgroundColor: '#1a1f3a',
          border: '1px solid #00ff00',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#00ff00', margin: 0 }}>📊 Statistics</h3>
            <button
              onClick={() => setShowStats(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ff6666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
          <div style={{ color: '#aaa' }}>
            <div style={{ marginBottom: '0.5rem' }}>Total Questions: <span style={{ color: '#00ff00' }}>{stats.totalQuestions}</span></div>
            <div style={{ marginBottom: '1rem' }}>Avg Difficulty: <span style={{ color: '#00ff00' }}>{stats.avgDifficulty}</span></div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>By Category:</div>
              <div style={{ paddingLeft: '1rem' }}>
                {Object.entries(stats.byCategory).map(([cat, count]) => (
                  <div key={cat} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {cat}: <span style={{ color: '#00ff00' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {stats.allTags.length > 0 && (
              <div>
                <div style={{ marginBottom: '0.5rem' }}>Tags:</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingLeft: '1rem' }}>
                  {stats.allTags.map(tag => (
                    <span key={tag} style={{ backgroundColor: '#003366', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      <div style={{
        backgroundColor: '#1a1f3a',
        border: '1px solid #00ccff',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3 style={{ color: '#00ffff', marginBottom: '1rem' }}>
          📋 Questions ({filteredQuestions.length})
        </h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredQuestions.map(q => (
            <div
              key={q._id}
              style={{
                backgroundColor: editingId === q._id ? '#003366' : '#0a0e27',
                border: '1px solid #00ccff',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ color: '#00ffff', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {q.text.substring(0, 60)}...
              </div>
              
              {q.tags && q.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {q.tags.map(tag => (
                    <span key={tag} style={{ backgroundColor: '#003366', color: '#aaa', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.7rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>
                Difficulty: {q.difficulty} | Points: {q.points} | Coins: {q.requiredCoins}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEditQuestion(q)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#ffaa00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q._id)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#ff6666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No questions found
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            backgroundColor: notification.type === 'success' ? '#10b981' : 
                             notification.type === 'error' ? '#ef4444' :
                             notification.type === 'warning' ? '#f59e0b' : '#3b82f6',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px',
            wordWrap: 'break-word',
            fontFamily: 'monospace',
            fontSize: '0.95rem'
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
