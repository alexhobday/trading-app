import { useState, useEffect } from 'react';

function TopPicks() {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTopPicks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8787/api/stocks/top-picks');

      if (!response.ok) {
        throw new Error(`Failed to load top picks (Status: ${response.status})`);
      }

      const data = await response.json();

      if (data.picks && data.picks.length > 0) {
        setPicks(data.picks);
        setLastUpdated(new Date(data.timestamp));
      } else {
        setPicks([]);
        setError('No picks available at the moment.');
      }
    } catch (err) {
      console.error('Failed to fetch top picks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load top picks on component mount
    const timer = setTimeout(() => {
      fetchTopPicks();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'BUY': return '🚀';
      case 'SELL': return '📉';
      default: return '⏸️';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'positive';
      case 'SELL': return 'negative';
      default: return 'neutral';
    }
  };

  const getActionBg = (action) => {
    switch (action) {
      case 'BUY': return '#e8f5e8';
      case 'SELL': return '#ffeaea';
      default: return '#f0f0f0';
    }
  };

  return (
    <div className="card">
      <h2>🌟 Top Small Cap Picks</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        AI-powered analysis of trending small & micro-cap stocks with buy/sell recommendations
      </p>

      <button onClick={fetchTopPicks} className="btn" disabled={loading}>
        {loading ? 'Loading...' : 'Get Latest Picks'}
      </button>

      {error && (
        <div className="error" style={{ marginTop: '20px' }}>
          {error}
        </div>
      )}

      {picks.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {lastUpdated && (
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
              Updated: {lastUpdated.toLocaleString()}
            </div>
          )}

          {picks.map((pick, index) => {
            const action = pick.recommendation?.action || 'HOLD';
            const reasoning = pick.recommendation?.reasoning ||
                             pick.recommendation?.reason ||
                             (pick.aiInsights ? pick.aiInsights.summary : 'Technical analysis-based recommendation');

            return (
              <div key={index} className="position" style={{ marginBottom: '15px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getActionBadge(action)}</span>
                    <strong>{pick.symbol}</strong>
                    <span
                      className={getActionColor(action)}
                      style={{
                        fontSize: '0.8rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: getActionBg(action)
                      }}
                    >
                      {action}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                    {pick.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                    {reasoning}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>${pick.currentPrice}</div>
                  <div
                    className={(pick.changePercent || 0) >= 0 ? 'positive' : 'negative'}
                    style={{ fontSize: '0.9rem' }}
                  >
                    {(pick.changePercent || 0) >= 0 ? '+' : ''}{(pick.changePercent || 0).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {pick.recommendation?.confidence || 'LOW'} confidence
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TopPicks;