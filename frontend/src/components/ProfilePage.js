import React, { useState, useEffect } from 'react';

function ProfilePage({ cartItems, setCartItems, setActiveTab, setAppLoggedIn }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');
    if (token && userEmail) {
      setIsLoggedIn(true);
      setEmail(userEmail);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('email', data.email);
      setIsLoggedIn(true);
      if (setAppLoggedIn) setAppLoggedIn(true);
      setActiveTab('home');
      
      if (setCartItems) {
        const savedCart = localStorage.getItem(data.email + '_cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    if (setAppLoggedIn) setAppLoggedIn(false);
    setEmail('');
    setPassword('');
    if (setCartItems) {
      setCartItems([]);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="page-container fade-in" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
        <div className="ml-card" style={{width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 30px'}}>
          <div style={{fontSize: '48px', marginBottom: '20px'}}>👤</div>
          <h2 style={{marginBottom: '10px'}}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>
            {isRegistering ? 'Sign up to sync your preferences' : 'Sign in to save your carts and preferences'}
          </p>
          
          {error && <div style={{color: '#ef4444', marginBottom: '15px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px'}}>{error}</div>}
          
          <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <input 
              type="email" 
              placeholder="Email Address" 
              className="search-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{width: '100%', padding: '14px 20px', borderRadius: 'var(--radius-sm)'}}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="search-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{width: '100%', padding: '14px 20px', borderRadius: 'var(--radius-sm)'}}
            />
            <button disabled={loading} type="submit" className="btn-buy" style={{padding: '14px', marginTop: '10px', fontSize: '16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1}}>
              {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          <p style={{marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)'}}>
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <span 
              style={{color: 'var(--accent-teal)', cursor: 'pointer'}} 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            >
              {isRegistering ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fff'}}>
            {email ? email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2>My Profile</h2>
            <p>{email}</p>
          </div>
        </div>
        <button className="btn-cart" onClick={handleLogout} style={{padding: '10px 20px'}}>Sign Out</button>
      </div>

      <div className="main-grid">
        <div className="profile-section">
          <div className="ml-card" style={{marginBottom: '30px'}}>
            <h3 style={{marginBottom: '20px'}}>Saved Carts</h3>
            {cartItems.length > 0 ? (
              <div className="saved-cart-card" style={{background: 'var(--inner-bg)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                  <span style={{fontWeight: '600'}}>Current Session Cart</span>
                  <span style={{color: 'var(--text-muted)'}}>{cartItems.length} items</span>
                </div>
                <div style={{display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px'}}>
                  {cartItems.map((item, i) => (
                    <div key={i} style={{background: 'var(--card-bg)', padding: '10px', borderRadius: '8px', minWidth: '120px', fontSize: '13px', flexShrink: 0}}>
                      <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500'}}>{item.name}</div>
                      <div style={{color: 'var(--accent-teal)', marginTop: '5px'}}>₹{item.price}</div>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn-buy" 
                  style={{marginTop: '15px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                  onClick={() => setActiveTab('cart')}
                >
                  Go to Cart
                </button>
              </div>
            ) : (
              <p style={{color: 'var(--text-muted)'}}>You have no saved carts. Add items to your cart to see them here.</p>
            )}
          </div>
          
          <div className="ml-card">
            <h3 style={{marginBottom: '20px'}}>Recent Searches</h3>
            <ul style={{listStyle: 'none', padding: 0}}>
              {['Dolo 650', 'Paracetamol 500mg', 'Vitamin C Zinc'].map((search, i) => (
                <li key={i} style={{padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--card-border)' : 'none', display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span style={{color: 'var(--text-muted)'}}>🔍</span> {search}
                  </span>
                  <button className="btn-cart" style={{padding: '6px 12px', fontSize: '12px'}} onClick={() => { setActiveTab('home'); }}>Search Again</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="profile-settings ml-card" style={{alignSelf: 'start'}}>
          <h3 style={{marginBottom: '20px'}}>Account Settings</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div className="setting-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--inner-bg)', borderRadius: '8px'}}>
              <div>
                <h4 style={{marginBottom: '4px'}}>Email Notifications</h4>
                <p style={{fontSize: '12px', color: 'var(--text-muted)'}}>Receive price drop alerts</p>
              </div>
              <div className="toggle" style={{width: '40px', height: '20px', background: 'var(--accent-teal)', borderRadius: '10px', position: 'relative', cursor: 'pointer'}}>
                <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px'}}></div>
              </div>
            </div>
            <button onClick={handleLogout} style={{padding: '12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s', fontWeight: 'bold'}} onMouseOver={(e) => e.target.style.background='rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.target.style.background='transparent'}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
