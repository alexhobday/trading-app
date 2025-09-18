export function PortfolioSummary({ cash, totalValue, positions }) {
  return (
    <div class="card">
      <h2>📊 Portfolio Summary</h2>
      <div class="grid">
        <div>
          <h3>Cash Balance</h3>
          <div class="cash">${cash}</div>
        </div>
        <div>
          <h3>Total Portfolio Value</h3>
          <div class="cash">${totalValue}</div>
        </div>
      </div>

      <div style="margin-top: 30px;">
        <h3>Current Positions</h3>
        {Object.keys(positions).length === 0 ? (
          <p style="color: #666; font-style: italic;">No positions yet. Start trading!</p>
        ) : (
          Object.entries(positions).map(([symbol, data]) => (
            <div class="position" key={symbol}>
              <div>
                <strong>{symbol}</strong>
                <div style="font-size: 0.9rem; color: #666;">
                  {data.shares} shares @ ${data.price}
                </div>
              </div>
              <div style="text-align: right;">
                <div>${data.value}</div>
                <div class={(data.change || 0) >= 0 ? 'positive' : 'negative'}>
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