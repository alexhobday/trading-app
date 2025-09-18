-- D1 Database Schema for Micro Cap Trader

-- Portfolio table to store current positions and cash
CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    shares INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cash balance table (separate for easier management)
CREATE TABLE IF NOT EXISTS cash_balance (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Only one row allowed
    amount REAL NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trade log table to store all buy/sell transactions
CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
    symbol TEXT NOT NULL,
    shares INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio history snapshots (daily summaries)
CREATE TABLE IF NOT EXISTS portfolio_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    cash REAL NOT NULL,
    total_value REAL NOT NULL,
    positions TEXT, -- JSON string of positions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON portfolio(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_date ON portfolio_history(date);

-- Insert initial cash balance if not exists
INSERT OR IGNORE INTO cash_balance (id, amount) VALUES (1, 0);