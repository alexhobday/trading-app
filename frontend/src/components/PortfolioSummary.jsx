function PortfolioSummary({ cash, totalValue, positions }) {
  return (
    <div className="card">
      <h2>📊 Portfolio Summary</h2>
      <div className="grid">
        <div>
          <h3>Cash Balance</h3>
          <div className="cash">${cash}</div>
        </div>
        <div>
          <h3>Total Portfolio Value</h3>
          <div className="cash">${totalValue}</div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Current Positions</h3>
        {Object.keys(positions || {}).length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No positions yet. Start trading!</p>
        ) : (
          Object.entries(positions).map(([symbol, data]) => (
            <div className="position" key={symbol}>
              <div>
                <strong>{symbol}</strong>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {data.shares} shares @ ${data.price}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>${data.value}</div>
                <div className={(data.change || 0) >= 0 ? 'positive' : 'negative'}>
                  {(data.change || 0) >= 0 ? '+' : ''}{(data.change || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PortfolioSummary;