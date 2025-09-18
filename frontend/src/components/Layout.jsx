import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const location = useLocation();

  const navItems = [
    {
      section: 'Portfolio',
      items: [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/portfolio', label: 'Holdings', icon: '💰' },
        { path: '/trading', label: 'Trading', icon: '🔄' }
      ]
    },
    {
      section: 'Research',
      items: [
        { path: '/analysis', label: 'Stock Analysis', icon: '📈' },
        { path: '/search', label: 'Stock Search', icon: '🔍' },
        { path: '/picks', label: 'Top Picks', icon: '🌟' }
      ]
    },
    {
      section: 'Tools',
      items: [
        { path: '/quotes', label: 'Quick Quote', icon: '💹' }
      ]
    }
  ];

  const pageTitles = {
    '/': 'Dashboard',
    '/portfolio': 'Portfolio Holdings',
    '/trading': 'Trading',
    '/analysis': 'Stock Analysis',
    '/search': 'Stock Search',
    '/picks': 'Top Picks',
    '/quotes': 'Quick Quote'
  };

  useEffect(() => {
    setCurrentPage(pageTitles[location.pathname] || 'Dashboard');
  }, [location.pathname]);

  useEffect(() => {
    const updateTime = () => {
      const timeElement = document.getElementById('last-updated');
      if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Micro Cap Trader</h1>
          <p>AI-Powered Trading Platform</p>
        </div>
        <div className="sidebar-nav">
          {navItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">{currentPage}</h1>
          <div>
            <span style={{ fontSize: '0.875rem', color: '#718096' }}>
              Last updated: <span id="last-updated"></span>
            </span>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;