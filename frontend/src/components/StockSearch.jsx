import { useState } from 'react';

function StockSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(`http://localhost:8787/api/stocks/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🔍 Stock Search</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Search for stocks by symbol or company name
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter stock symbol or company name"
          className="input"
          required
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Searching...' : 'Search Stocks'}
        </button>
      </form>
      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {results.map((stock, index) => (
            <div key={index} className="position">
              <div>
                <strong>{stock.symbol}</strong>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {stock.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>${stock.price}</div>
                <div className={stock.change >= 0 ? 'positive' : 'negative'}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StockSearch;