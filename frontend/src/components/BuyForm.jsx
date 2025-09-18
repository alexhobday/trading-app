import { useState } from 'react';

function BuyForm() {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8787/api/trades/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          shares: parseInt(shares)
        }),
      });

      if (response.ok) {
        const result = await response.text();
        setMessage({ type: 'success', text: result });
        setSymbol('');
        setShares('');
      } else {
        const error = await response.text();
        setMessage({ type: 'error', text: error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📈 Buy Stocks</h2>
      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}
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
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="Number of shares"
          className="input"
          min="1"
          required
        />
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Buying...' : 'Buy Stock'}
        </button>
      </form>
    </div>
  );
}

export default BuyForm;