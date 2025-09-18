export function CashForm() {
  return (
    <div class="card">
      <h2>💰 Set Cash Balance</h2>
      <form hx-post="/api/portfolio/cash" hx-target="#messages" hx-swap="innerHTML">
        <input type="number" name="amount" placeholder="Enter cash amount" class="input" step="0.01" min="0" required />
        <button type="submit" class="btn">Set Cash Balance</button>
      </form>
    </div>
  );
}

export function BuyForm() {
  return (
    <div class="card">
      <h2>📈 Buy Stocks</h2>
      <form hx-post="/api/trades/buy" hx-target="#messages" hx-swap="innerHTML">
        <input type="text" name="symbol" placeholder="Stock Symbol (e.g., AAPL)" class="input" required style="text-transform: uppercase;" />
        <input type="number" name="shares" placeholder="Number of shares" class="input" min="1" required />
        <button type="submit" class="btn btn-success">Buy Stock</button>
      </form>
    </div>
  );
}

export function SellForm() {
  return (
    <div class="card">
      <h2>📉 Sell Stocks</h2>
      <form hx-post="/api/trades/sell" hx-target="#messages" hx-swap="innerHTML">
        <input type="text" name="symbol" placeholder="Stock Symbol (e.g., AAPL)" class="input" required style="text-transform: uppercase;" />
        <input type="number" name="shares" placeholder="Number of shares" class="input" min="1" required />
        <button type="submit" class="btn btn-danger">Sell Stock</button>
      </form>
    </div>
  );
}