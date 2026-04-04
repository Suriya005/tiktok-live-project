import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { 
  connectToTikTok, 
  disconnectFromTikTok, 
  getTikTokStatus 
} from '../../services/tiktokService';
import '../Dashboard.css';

const TikTokConnection = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gifts, setGifts] = useState([]);
  const [giftMappings] = useState([
    { giftId: 5655, giftName: 'Rose', eventName: 'Fireball', points: 10 },
    { giftId: 5269, giftName: 'TikTok', eventName: 'Lightning', points: 50 },
    { giftId: 5827, giftName: 'Perfume', eventName: 'Explosion', points: 100 },
  ]);

  useEffect(() => {
    checkStatus();
    loadGifts();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadGifts = async () => {
    try {
      const response = await fetch('/tiktok_gifts.json');
      const data = await response.json();
      setGifts(data);
    } catch (err) {
      console.error('Failed to load gifts:', err);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await getTikTokStatus();
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to get status:', err);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await connectToTikTok(username);
      await checkStatus();
      setUsername('');
      alert('เชื่อมต่อ TikTok Live สำเร็จ!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectFromTikTok();
      await checkStatus();
      alert('ตัดการเชื่อมต่อแล้ว');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🎥 TikTok Live Connection</h1>
          <p>เชื่อมต่อกับ TikTok Live เพื่อรับของขวัญ</p>
        </div>

        {/* Status Card */}
        <div className="tiktok-status-card">
          <div className="status-header">
            <h2>สถานะการเชื่อมต่อ</h2>
            <div className={`status-indicator ${status?.connected ? 'connected' : 'disconnected'}`}>
              {status?.connected ? '🟢 เชื่อมต่อแล้ว' : '🔴 ไม่ได้เชื่อมต่อ'}
            </div>
          </div>
          
          {status?.connected && (
            <div className="connected-info">
              <p>👤 Username: <strong>{status.username}</strong></p>
              <button 
                className="btn-danger" 
                onClick={handleDisconnect}
                disabled={loading}
              >
                ตัดการเชื่อมต่อ
              </button>
            </div>
          )}
        </div>

        {/* Connection Form */}
        {!status?.connected && (
          <div className="connection-form-card">
            <h2>เชื่อมต่อ TikTok Live</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleConnect}>
              <div className="form-group">
                <label>TikTok Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  required
                />
                <small>ใส่ username ของคุณ (ต้องมี @ นำหน้า)</small>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'กำลังเชื่อมต่อ...' : '🔌 เชื่อมต่อ'}
              </button>
            </form>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-card">
          <h3>📝 วิธีใช้งาน</h3>
          <ol>
            <li>ใส่ TikTok username ของคุณ (ต้องขึ้นต้นด้วย @)</li>
            <li>กดปุ่ม "เชื่อมต่อ"</li>
            <li>เปิด TikTok Live บนมือถือของคุณ</li>
            <li>เมื่อมีคนส่งของขวัญ ระบบจะแปลงเป็น event โดยอัตโนมัติ</li>
          </ol>
          
          <h3>🎁 Gift Mappings ({giftMappings.length} events)</h3>
          <div className="gift-mappings">
            {giftMappings.map((mapping) => {
              const gift = gifts.find(g => g.id === mapping.giftId);
              return (
                <div key={mapping.giftId} className="gift-item">
                  <div className="gift-info">
                    {gift?.image_url && (
                      <img src={gift.image_url} alt={mapping.giftName} className="gift-icon" />
                    )}
                    <div className="gift-details">
                      <span className="gift-name">{mapping.giftName}</span>
                      {gift && <span className="gift-cost">💎 {gift.diamond_cost} coins</span>}
                    </div>
                  </div>
                  <span className="arrow">→</span>
                  <span className="event-name">{mapping.eventName} ({mapping.points} points)</span>
                </div>
              );
            })}
          </div>
          
          <h3>📦 Available Gifts ({gifts.length})</h3>
          <div className="gifts-grid">
            {gifts.slice(0, 12).map((gift) => (
              <div key={gift.id} className="gift-card">
                <img src={gift.image_url} alt={gift.name} />
                <div className="gift-card-info">
                  <p className="gift-card-name">{gift.name}</p>
                  <p className="gift-card-cost">💎 {gift.diamond_cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tiktok-status-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .status-indicator {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .status-indicator.connected {
          background: #d4edda;
          color: #155724;
        }

        .status-indicator.disconnected {
          background: #f8d7da;
          color: #721c24;
        }

        .connected-info {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .connected-info p {
          margin-bottom: 1rem;
        }

        .connection-form-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .connection-form-card h2 {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }

        .form-group small {
          display: block;
          margin-top: 0.5rem;
          color: #666;
          font-size: 14px;
        }

        .btn-danger {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .instructions-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .instructions-card h3 {
          margin-bottom: 1rem;
          color: #667eea;
        }

        .instructions-card ol {
          margin-left: 1.5rem;
          margin-bottom: 2rem;
        }

        .instructions-card li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .gift-mappings {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .gift-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          gap: 1rem;
        }

        .gift-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .gift-icon {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .gift-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .gift-name {
          font-weight: 600;
          color: #667eea;
        }

        .gift-cost {
          font-size: 12px;
          color: #999;
        }

        .arrow {
          color: #999;
          font-size: 20px;
        }

        .event-name {
          font-weight: 500;
          color: #333;
          flex: 1;
        }

        .gifts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .gift-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: transform 0.2s;
        }

        .gift-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gift-card img {
          width: 64px;
          height: 64px;
          object-fit: contain;
          margin-bottom: 0.5rem;
        }

        .gift-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .gift-card-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .gift-card-cost {
          font-size: 12px;
          color: #667eea;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default TikTokConnection;
