export function renderApp(portfolioData) {
  const { cash, positions, totalValue } = portfolioData;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Micro Cap Trader</title>
  <script src="https://unpkg.com/htmx.org@2.0.2"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header p {
      color: #666;
      font-size: 1.1rem;
    }
    .card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    .card h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 1.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }
    .btn {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    }
    .btn-success { background: linear-gradient(45deg, #56ab2f, #a8e6cf); }
    .btn-danger { background: linear-gradient(45deg, #ff416c, #ff4b2b); }
    .input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      font-size: 1rem;
      margin-bottom: 15px;
      transition: border-color 0.3s;
    }
    .input:focus {
      outline: none;
      border-color: #667eea;
    }
    .cash { font-size: 2rem; font-weight: bold; color: #27ae60; }
    .position {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      margin-bottom: 10px;
    }
    .positive { color: #27ae60; }
    .negative { color: #e74c3c; }
    .error {
      background: #fff5f5;
      color: #e53e3e;
      padding: 15px;
      border-radius: 10px;
      border-left: 4px solid #e53e3e;
      margin-bottom: 20px;
    }
    .success {
      background: #f0fff4;
      color: #38a169;
      padding: 15px;
      border-radius: 10px;
      border-left: 4px solid #38a169;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Micro Cap Trader</h1>
      <p>Your AI-powered trading companion</p>
    </div>

    <div id="messages"></div>

    <!-- Portfolio Summary -->
    <div class="card">
      <h2>📊 Portfolio Summary</h2>
      <div class="grid">
        <div>
          <h3>Cash Balance</h3>
          <div class="cash">$${cash}</div>
        </div>
        <div>
          <h3>Total Portfolio Value</h3>
          <div class="cash">$${totalValue}</div>
        </div>
      </div>

      <div style="margin-top: 30px;">
        <h3>Current Positions</h3>
        ${Object.keys(positions).length === 0 ?
          '<p style="color: #666; font-style: italic;">No positions yet. Start trading!</p>' :
          Object.entries(positions).map(([symbol, data]) => `
            <div class="position">
              <div>
                <strong>${symbol}</strong>
                <div style="font-size: 0.9rem; color: #666;">
                  ${data.shares} shares @ $${data.price}
                </div>
              </div>
              <div style="text-align: right;">
                <div>$${data.value}</div>
                <div class="${data.change >= 0 ? 'positive' : 'negative'}">
                  ${data.change >= 0 ? '+' : ''}${data.change?.toFixed(2)}%
                </div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>

    <!-- Set Cash -->
    <div class="card">
      <h2>💰 Set Cash Balance</h2>
      <form hx-post="/api/portfolio/cash" hx-target="#messages" hx-swap="innerHTML">
        <input type="number" name="amount" placeholder="Enter cash amount" class="input" step="0.01" min="0" required />
        <button type="submit" class="btn">Set Cash Balance</button>
      </form>
    </div>

    <!-- Trading -->
    <div class="grid">
      <div class="card">
        <h2>📈 Buy Stocks</h2>
        <form hx-post="/api/trades/buy" hx-target="#messages" hx-swap="innerHTML">
          <input type="text" name="symbol" placeholder="Stock Symbol (e.g., AAPL)" class="input" required style="text-transform: uppercase;" />
          <input type="number" name="shares" placeholder="Number of shares" class="input" min="1" required />
          <button type="submit" class="btn btn-success">Buy Stock</button>
        </form>
      </div>

      <div class="card">
        <h2>📉 Sell Stocks</h2>
        <form hx-post="/api/trades/sell" hx-target="#messages" hx-swap="innerHTML">
          <input type="text" name="symbol" placeholder="Stock Symbol (e.g., AAPL)" class="input" required style="text-transform: uppercase;" />
          <input type="number" name="shares" placeholder="Number of shares" class="input" min="1" required />
          <button type="submit" class="btn btn-danger">Sell Stock</button>
        </form>
      </div>
    </div>

    <!-- Stock Search -->
    <div class="card">
      <h2>🔍 Search Stocks</h2>
      <form hx-get="/api/stocks/search" hx-target="#search-results" hx-trigger="input changed delay:500ms from:#search-input">
        <input id="search-input" type="text" name="q" placeholder="Search for stocks (e.g., Apple, TSLA)" class="input" />
      </form>
      <div id="search-results"></div>
    </div>

    <!-- Stock Quote -->
    <div class="card">
      <h2>💹 Get Stock Quote</h2>
      <form hx-get="/quote" hx-target="#quote-result" hx-trigger="submit">
        <input type="text" name="symbol" placeholder="Stock Symbol (e.g., AAPL)" class="input" required style="text-transform: uppercase;" />
        <button type="submit" class="btn">Get Quote</button>
      </form>
      <div id="quote-result"></div>
    </div>
  </div>
</body>
</html>`;
}