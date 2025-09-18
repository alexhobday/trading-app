import { useState } from 'react';

function CashForm() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8787/api/portfolio/cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (response.ok) {
        const result = await response.text();
        setMessage({ type: 'success', text: result });
        setAmount('');
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
      <h2>💰 Set Cash Balance</h2>
      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter cash amount"
          className="input"
          step="0.01"
          min="0"
          required
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Setting...' : 'Set Cash Balance'}
        </button>
      </form>
    </div>
  );
}

export default CashForm;