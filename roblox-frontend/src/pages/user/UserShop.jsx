import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { getAllGameEvents, createEventQueue, createBulkEventQueue } from '../../services/robloxService';
import '../Dashboard.css';
import './Shop.css';

const UserShop = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(1000); // Mock balance
  const [cart, setCart] = useState([]);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getAllGameEvents({ is_active: true });
      setEvents(response.data);
    } catch (error) {
      console.error('Load events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (event) => {
    const existing = cart.find(item => item._id === event._id);
    if (existing) {
      // ถ้า multi_spawn = false ห้ามเพิ่มจำนวน (ซื้อได้แค่ 1 ต่อบิล)
      if (!event.multi_spawn) {
        alert('สินค้านี้ซื้อได้ 1 ชิ้นต่อรอบบิลเท่านั้น');
        return;
      }
      setCart(cart.map(item => 
        item._id === event._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...event, quantity: 1 }]);
    }
  };

  const removeFromCart = (eventId) => {
    setCart(cart.filter(item => item._id !== eventId));
  };

  const updateQuantity = (eventId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(eventId);
    } else {
      setCart(cart.map(item => {
        // ถ้า multi_spawn = false ห้ามเพิ่มจำนวนเกิน 1
        if (item._id === eventId && !item.multi_spawn && quantity > 1) {
          alert('สินค้านี้ซื้อได้ 1 ชิ้นต่อรอบบิลเท่านั้น');
          return item;
        }
        return item._id === eventId ? { ...item, quantity } : item;
      }));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.point_amount * item.quantity), 0);
  };

  const handleCheckout = async () => {
    const total = getTotalPrice();
    if (total > balance) {
      alert('ยอดเงินไม่เพียงพอ! กรุณาเติมเงิน');
      return;
    }

    try {
      // สร้าง queue สำหรับแต่ละ item ใน cart
      const queues = cart.map(item => ({
        user_id: user.id || user.email,
        game_id: item.game_id,
        event_name: item.event_name,
        amount: item.point_amount,
        delay: item.default_delay,
        quantity: item.quantity, // ส่ง quantity ไปที่ API
      }));

      // ถ้ามีสินค้ามากกว่า 1 ชนิด ใช้ bulk create, ถ้าไม่ใช้ single create
      if (queues.length > 1) {
        await createBulkEventQueue(queues);
      } else {
        await createEventQueue(queues[0]);
      }
      
      // หัก balance
      setBalance(balance - total);
      setCart([]);
      alert('ซื้อสำเร็จ! Event ถูกเพิ่มเข้า Queue แล้ว');
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error?.message || 'Purchase failed'));
    }
  };

  const handleTopup = () => {
    const amount = parseFloat(topupAmount);
    if (amount > 0) {
      setBalance(balance + amount);
      setTopupAmount('');
      setShowTopup(false);
      alert(`เติมเงินสำเร็จ ${amount} points!`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Event Shop</h1>
          <p>ซื้อ Event สำหรับเกม Roblox</p>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-info">
            <h3>ยอดเงินคงเหลือ</h3>
            <div className="balance-amount">{balance.toFixed(2)} Points</div>
          </div>
          <button className="btn-topup" onClick={() => setShowTopup(true)}>
            💰 เติมเงิน
          </button>
        </div>

        <div className="shop-layout">
          {/* Events Grid */}
          <div className="events-grid">
            <h2>Events ที่วางจำหน่าย</h2>
            <div className="products-grid">
              {events.map((event) => (
                <div key={event._id} className="product-card">
                  <div className="product-icon">
                    {event.is_animation ? '🎭' : '🎮'}
                  </div>
                  <h3>{event.event_name}</h3>
                  <p className="product-game">Game ID: {event.game_id}</p>
                  <div className="product-details">
                    <span>⏱️ Delay: {event.default_delay}s</span>
                    {event.multi_spawn && <span>✨ Multi Spawn</span>}
                  </div>
                  <div className="product-price">{event.point_amount} Points</div>
                  <button className="btn-buy" onClick={() => addToCart(event)}>
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="cart-sidebar">
            <h2>ตะกร้า ({cart.length})</h2>
            {cart.length === 0 ? (
              <p className="cart-empty">ตะกร้าว่าง</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.event_name}</h4>
                        <p>{item.point_amount} Points</p>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="btn-remove" onClick={() => removeFromCart(item._id)}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <h3>รวมทั้งหมด</h3>
                  <div className="total-amount">{getTotalPrice().toFixed(2)} Points</div>
                </div>
                <button className="btn-checkout" onClick={handleCheckout}>
                  ชำระเงิน
                </button>
              </>
            )}
          </div>
        </div>

        {/* Topup Modal */}
        {showTopup && (
          <div className="modal-overlay" onClick={() => setShowTopup(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>เติมเงิน</h2>
              <div className="form-group">
                <label>จำนวนเงิน (Points)</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                />
              </div>
              <div className="quick-amounts">
                <button onClick={() => setTopupAmount('100')}>100</button>
                <button onClick={() => setTopupAmount('500')}>500</button>
                <button onClick={() => setTopupAmount('1000')}>1000</button>
                <button onClick={() => setTopupAmount('5000')}>5000</button>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowTopup(false)}>ยกเลิก</button>
                <button className="btn-primary" onClick={handleTopup}>เติมเงิน</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserShop;
