import { useState } from 'react';

function StockAnalysis() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`http://localhost:8787/api/stocks/analyze-html?symbol=${symbol.toUpperCase()}`);
      if (response.ok) {
        const html = await response.text();
        setResult(html);
      } else {
        setResult('<div class="error">Failed to analyze stock</div>');
      }
    } catch (error) {
      setResult('<div class="error">Network error occurred</div>');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🧠 AI-Powered Stock Analysis</h2>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
        Get comprehensive analysis of small & micro-cap stocks with AI-powered insights, technical indicators, and trading recommendations.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol (e.g., SOFI, PLTR, UPST)"
          className="input"
          style={{ textTransform: 'uppercase' }}
          required
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Analyzing...' : '🔍 Analyze with AI'}
        </button>
      </form>
      {result && (
        <div dangerouslySetInnerHTML={{ __html: result }} />
      )}
    </div>
  );
}

export default StockAnalysis;