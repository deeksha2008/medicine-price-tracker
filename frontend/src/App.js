import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ResultsTable from './components/ResultsTable';
import MLInsights from './components/MLInsights';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import InsightsPage from './components/InsightsPage';
import ProfilePage from './components/ProfilePage';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      const savedCart = localStorage.getItem(email + '_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, []);

  const handleAddToCart = (item) => {
    const itemToAdd = { ...item, name: item.name || query };
    setCartItems(prev => {
      const newCart = [...prev, itemToAdd];
      const email = localStorage.getItem('email');
      if (email) localStorage.setItem(email + '_cart', JSON.stringify(newCart));
      return newCart;
    });
    setToast(`Added ${itemToAdd.name} to cart!`);
    setTimeout(() => setToast(null), 3000);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => {
      const newCart = prev.filter((_, i) => i !== index);
      const email = localStorage.getItem('email');
      if (email) localStorage.setItem(email + '_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleSearch = async (medicine) => {
    if (!medicine) return;
    setLoading(true);
    setError('');
    setQuery(medicine);
    setActiveTab('home');

    try {
      const response = await fetch(`http://localhost:8000/api/search?query=${encodeURIComponent(medicine)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('❌ Backend API unavailable');
      setResults(null);
    }
    setLoading(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cart':
        return <CartPage cartItems={cartItems} removeFromCart={removeFromCart} setActiveTab={setActiveTab} />;
      case 'checkout':
        return <CheckoutPage cartItems={cartItems} setActiveTab={setActiveTab} />;
      case 'insights':
        return <InsightsPage query={query} currentLowest={results?.results?.[0]?.price} />;
      case 'profile':
        return <ProfilePage cartItems={cartItems} setCartItems={setCartItems} setActiveTab={setActiveTab} />;
      case 'home':
      default:
        return (
          <div className="fade-in">
            <div className="home-hero" style={{textAlign: 'center', marginBottom: '40px'}}>
              <h1 style={{fontSize: '36px', marginBottom: '10px', textShadow: '0 0 20px rgba(20, 184, 166, 0.3)'}}>
                Smart Medicine Price Tracker
              </h1>
              <p style={{color: 'var(--text-muted)', fontSize: '16px'}}>
                Compare prices, track trends, and find generic alternatives across top Indian pharmacies.
              </p>
            </div>
            
            <SearchBar onSearch={handleSearch} />
            
            {loading && <div className="loading-state" style={{marginTop: '40px', textAlign: 'center'}}>🔄 Fetching live prices from all pharmacies...</div>}
            {error && <div style={{ color: '#ef4444', margin: '40px 0', fontWeight: '500', textAlign: 'center' }}>{error}</div>}
            
            {(results || query) && !loading && (
              <div className="main-grid" style={{marginTop: '40px'}}>
                <div className="results-wrapper">
                   <ResultsTable results={results} onAddToCart={handleAddToCart} />
                </div>
                <div className="insights-wrapper">
                   <MLInsights query={query} currentLowest={results?.results?.[0]?.price} />
                </div>
              </div>
            )}
            
            {!results && !query && !loading && (
              <div className="empty-state" style={{marginTop: '60px'}}>
                <div style={{fontSize: '64px', marginBottom: '20px', opacity: 0.5}}>💊</div>
                <h3>Compare Medicine Prices</h3>
                <p style={{color: 'var(--text-muted)', marginTop: '10px'}}>Search for any medicine to instantly compare prices across PharmEasy, Netmeds, Apollo, and 1mg.</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-brand" onClick={() => setActiveTab('home')} style={{cursor: 'pointer'}}>
          <span role="img" aria-label="pill">💊</span> MediCompare
        </div>
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
          <button className={`nav-tab ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>Insights</button>
          <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`nav-tab cart-tab ${activeTab === 'cart' || activeTab === 'checkout' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
            🛒 Cart {cartItems.length > 0 && <span className="nav-cart-badge">{cartItems.length}</span>}
          </button>
        </div>
      </nav>

      <div className="app-content" style={{marginTop: '40px'}}>
        {renderContent()}
      </div>

      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span role="img" aria-label="check">✅</span> {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;