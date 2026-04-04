import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { getAllEventQueues, getQueueStats } from '../../services/robloxService';
import '../Dashboard.css';

const StreamerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      // ดึง queue ตาม user_id ของ streamer
      const params = filter === 'all' ? {} : { status: filter };
      const queueResponse = await getAllEventQueues({ ...params, user_id: user.id });
      setQueues(queueResponse.data);

      // ดึงสถิติ
      const statsResponse = await getQueueStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Streamer Dashboard</h1>
          <button 
            className="btn-tiktok" 
            onClick={() => navigate('/streamer/tiktok')}
          >
            🎥 TikTok Live Connection
          </button>
          <p>จัดการคิวและดูสถิติ</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Queues</h3>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="stat-value" style={{color: '#ffc107'}}>{stats.pending}</div>
            </div>
            <div className="stat-card">
              <h3>Processing</h3>
              <div className="stat-value" style={{color: '#17a2b8'}}>{stats.processing}</div>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <div className="stat-value" style={{color: '#28a745'}}>{stats.completed}</div>
            </div>
            <div className="stat-card">
              <h3>Failed</h3>
              <div className="stat-value" style={{color: '#dc3545'}}>{stats.failed}</div>
            </div>
          </div>
        )}

        {/* Queue Table */}
        <div className="content-section">
          <div className="section-header">
            <h2>Event Queue</h2>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'btn-filter active' : 'btn-filter'}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'PENDING' ? 'btn-filter active' : 'btn-filter'}
                onClick={() => setFilter('PENDING')}
              >
                Pending
              </button>
              <button 
                className={filter === 'PROCESSING' ? 'btn-filter active' : 'btn-filter'}
                onClick={() => setFilter('PROCESSING')}
              >
                Processing
              </button>
              <button 
                className={filter === 'COMPLETED' ? 'btn-filter active' : 'btn-filter'}
                onClick={() => setFilter('COMPLETED')}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Amount</th>
                  <th>Delay (s)</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Processed At</th>
                </tr>
              </thead>
              <tbody>
                {queues.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  queues.map((queue) => (
                    <tr key={queue._id}>
                      <td>{queue.event_name}</td>
                      <td>{queue.amount}</td>
                      <td>{queue.delay}</td>
                      <td>
                        <span className={`badge badge-${queue.status.toLowerCase()}`}>
                          {queue.status}
                        </span>
                      </td>
                      <td>{new Date(queue.created_at).toLocaleString('th-TH')}</td>
                      <td>
                        {queue.processed_at 
                          ? new Date(queue.processed_at).toLocaleString('th-TH')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .btn-filter {
          padding: 8px 16px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        .btn-filter:hover {
          background: #f0f0f0;
        }
        .btn-filter.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-tiktok {
          background: linear-gradient(135deg, #fe2c55 0%, #000000 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s;
        }
        .btn-tiktok:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(254, 44, 85, 0.4);
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default StreamerDashboard;
