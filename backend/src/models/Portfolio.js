export class D1Portfolio {
  constructor(db) {
    this.db = db;
  }

  async init() {
    // Ensure we have a cash balance record
    const result = await this.db.prepare(
      `INSERT OR IGNORE INTO cash_balance (id, amount) VALUES (1, 0)`
    ).run();
  }

  async getPositions() {
    const stmt = this.db.prepare(`
      SELECT symbol, shares
      FROM portfolio
      WHERE shares > 0
    `);

    const results = await stmt.all();
    const positions = {};

    for (const row of results.results) {
      positions[row.symbol] = row.shares;
    }

    return positions;
  }

  async getCash() {
    const stmt = this.db.prepare(`SELECT amount FROM cash_balance WHERE id = 1`);
    const result = await stmt.first();
    return result ? result.amount : 0;
  }

  async setCash(amount) {
    const stmt = this.db.prepare(`
      UPDATE cash_balance
      SET amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    await stmt.bind(amount).run();
  }

  async buy(symbol, shares, price) {
    const cost = shares * price;
    const currentCash = await this.getCash();

    if (cost > currentCash) {
      throw new Error(`Insufficient funds. Need $${cost.toFixed(2)}, have $${currentCash.toFixed(2)}`);
    }

    // Start transaction
    const batch = [
      // Update cash
      this.db.prepare(`
        UPDATE cash_balance
        SET amount = amount - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).bind(cost),

      // Update or insert position
      this.db.prepare(`
        INSERT INTO portfolio (symbol, shares, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(symbol) DO UPDATE SET
          shares = portfolio.shares + excluded.shares,
          updated_at = CURRENT_TIMESTAMP
      `).bind(symbol, shares),

      // Log trade
      this.db.prepare(`
        INSERT INTO trades (action, symbol, shares, price, total, timestamp)
        VALUES ('BUY', ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(symbol, shares, price, cost)
    ];

    await this.db.batch(batch);
    await this.saveSnapshot();
  }

  async sell(symbol, shares, price) {
    const currentPosition = await this.getPositionBySymbol(symbol);

    if (!currentPosition || currentPosition.shares < shares) {
      throw new Error(`Insufficient shares of ${symbol}. Have ${currentPosition?.shares || 0}, need ${shares}`);
    }

    const proceeds = shares * price;

    // Start transaction
    const batch = [
      // Update cash
      this.db.prepare(`
        UPDATE cash_balance
        SET amount = amount + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).bind(proceeds),

      // Update position
      this.db.prepare(`
        UPDATE portfolio
        SET shares = shares - ?, updated_at = CURRENT_TIMESTAMP
        WHERE symbol = ?
      `).bind(shares, symbol),

      // Log trade
      this.db.prepare(`
        INSERT INTO trades (action, symbol, shares, price, total, timestamp)
        VALUES ('SELL', ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(symbol, shares, price, proceeds)
    ];

    await this.db.batch(batch);

    // Remove position if shares = 0
    const newPosition = await this.getPositionBySymbol(symbol);
    if (newPosition && newPosition.shares <= 0) {
      await this.db.prepare(`DELETE FROM portfolio WHERE symbol = ?`).bind(symbol).run();
    }

    await this.saveSnapshot();
  }

  async getPositionBySymbol(symbol) {
    const stmt = this.db.prepare(`
      SELECT symbol, shares
      FROM portfolio
      WHERE symbol = ? AND shares > 0
    `);
    return await stmt.bind(symbol).first();
  }

  async getTotalValue(stockService) {
    const positions = await this.getPositions();
    const cash = await this.getCash();
    let totalValue = cash;

    for (const [symbol, shares] of Object.entries(positions)) {
      try {
        const quote = await stockService.getQuote(symbol);
        totalValue += shares * quote.price;
      } catch (error) {
        console.warn(`Could not fetch price for ${symbol}`);
      }
    }

    return totalValue;
  }

  async saveSnapshot() {
    const cash = await this.getCash();
    const positions = await this.getPositions();
    const today = new Date().toISOString().split('T')[0];

    // Calculate total value would require stock service, so we'll store 0 for now
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO portfolio_history (date, cash, total_value, positions)
      VALUES (?, ?, ?, ?)
    `);

    await stmt.bind(
      today,
      cash,
      cash, // We'll update this when we have stock prices
      JSON.stringify(positions)
    ).run();
  }

  async getHistory() {
    const stmt = this.db.prepare(`
      SELECT * FROM portfolio_history
      ORDER BY date DESC
      LIMIT 30
    `);

    const result = await stmt.all();
    return result.results.map(row => ({
      date: row.date,
      cash: row.cash,
      totalValue: row.total_value,
      positions: JSON.parse(row.positions || '{}')
    }));
  }

  async getTradeHistory() {
    const stmt = this.db.prepare(`
      SELECT * FROM trades
      ORDER BY timestamp DESC
      LIMIT 100
    `);

    const result = await stmt.all();
    return result.results;
  }

  // SQLite doesn't have CREATE UNIQUE INDEX IF NOT EXISTS in the same way
  async ensureUniqueSymbolIndex() {
    try {
      await this.db.prepare(`CREATE UNIQUE INDEX idx_portfolio_symbol_unique ON portfolio(symbol)`).run();
    } catch (e) {
      // Index likely already exists
    }
  }
}