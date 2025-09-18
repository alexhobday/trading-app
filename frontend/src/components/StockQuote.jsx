import { useState } from 'react';

function StockQuote() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuote(null);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8787/api/stocks/quote?symbol=${symbol.toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data);
      } else {
        const errorText = await response.text();
        setError(errorText);
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>💹 Quick Quote</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Get real-time stock quotes and basic information
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol (e.g., AAPL)"
          className="input"
          style={{ textTransform: 'uppercase' }}
          required
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Getting Quote...' : 'Get Quote'}
        </button>
      </form>
      
      {error && (
        <div className="error" style={{ marginTop: '20px' }}>
          {error}
        </div>
      )}
      
      {quote && (
        <div style={{ marginTop: '20px' }}>
          <div className="position">
            <div>
              <strong>{quote.symbol}</strong>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {quote.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${quote.price}</div>
              <div className={quote.change >= 0 ? 'positive' : 'negative'}>
                {quote.change >= 0 ? '+' : ''}{quote.change} ({quote.changePercent}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockQuote;