import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAllGameEvents, createGameEvent, updateGameEvent, deleteGameEvent, toggleGameEvent } from '../../services/robloxService';
import '../Dashboard.css';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    game_id: '',
    event_name: '',
    default_delay: 0,
    point_amount: 0,
    multi_spawn: false,
    is_animation: false,
    is_active: true,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getAllGameEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Load events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateGameEvent(editingEvent._id, formData);
      } else {
        await createGameEvent(formData);
      }
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Error saving event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      game_id: event.game_id,
      event_name: event.event_name,
      default_delay: event.default_delay,
      point_amount: event.point_amount,
      multi_spawn: event.multi_spawn,
      is_animation: event.is_animation,
      is_active: event.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('ต้องการลบ event นี้?')) {
      try {
        await deleteGameEvent(id);
        loadEvents();
      } catch (error) {
        alert('Error deleting event');
      }
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleGameEvent(id, !currentStatus);
      loadEvents();
    } catch (error) {
      alert('Error toggling event');
    }
  };

  const resetForm = () => {
    setFormData({
      game_id: '',
      event_name: '',
      default_delay: 0,
      point_amount: 0,
      multi_spawn: false,
      is_animation: false,
      is_active: true,
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>จัดการ Game Events</p>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Game Events</h2>
            <button className="btn-add" onClick={() => { resetForm(); setShowModal(true); }}>
              + เพิ่ม Event
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Game ID</th>
                  <th>Event Name</th>
                  <th>Delay (s)</th>
                  <th>Points</th>
                  <th>Multi Spawn</th>
                  <th>Animation</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>{event.game_id}</td>
                    <td>{event.event_name}</td>
                    <td>{event.default_delay}</td>
                    <td>{event.point_amount}</td>
                    <td>{event.multi_spawn ? '✅' : '❌'}</td>
                    <td>{event.is_animation ? '✅' : '❌'}</td>
                    <td>
                      <span className={`badge ${event.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn-small btn-edit" onClick={() => handleEdit(event)}>แก้ไข</button>
                        <button className="btn-small btn-toggle" onClick={() => handleToggle(event._id, event.is_active)}>
                          {event.is_active ? 'ปิด' : 'เปิด'}
                        </button>
                        <button className="btn-small btn-delete" onClick={() => handleDelete(event._id)}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingEvent ? 'แก้ไข Event' : 'เพิ่ม Event ใหม่'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Game ID</label>
                  <input
                    type="text"
                    value={formData.game_id}
                    onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Event Name</label>
                  <input
                    type="text"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Default Delay (seconds)</label>
                  <input
                    type="number"
                    value={formData.default_delay}
                    onChange={(e) => setFormData({ ...formData, default_delay: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Point Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.point_amount}
                    onChange={(e) => setFormData({ ...formData, point_amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.multi_spawn}
                      onChange={(e) => setFormData({ ...formData, multi_spawn: e.target.checked })}
                    />
                    Multi Spawn
                  </label>
                </div>
                <div className="form-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_animation}
                      onChange={(e) => setFormData({ ...formData, is_animation: e.target.checked })}
                    />
                    Animation
                  </label>
                </div>
                <div className="form-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
                  <button type="submit" className="btn-primary">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-content h2 {
          margin-bottom: 1.5rem;
        }
        .form-check {
          margin: 1rem 0;
        }
        .form-check label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-cancel:hover {
          background: #e9ecef;
          border-color: #adb5bd;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
