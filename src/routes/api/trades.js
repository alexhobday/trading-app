import { Hono } from 'hono';
import { Portfolio } from '../../models.js';
import { StockService } from '../../services.js';

const trades = new Hono();

// Buy stocks
trades.post('/buy', async (c) => {
  try {
    const db = c.get('db');
    const portfolio = new Portfolio(db);
    const stocks = new StockService();
    const { symbol, shares } = await c.req.json();

    if (!symbol || typeof symbol !== 'string') {
      return c.json({ error: 'Symbol is required and must be a string' }, 400);
    }

    if (!shares || typeof shares !== 'number' || shares <= 0) {
      return c.json({ error: 'Shares must be a positive number' }, 400);
    }

    const upperSymbol = symbol.toUpperCase();
    const quote = await stocks.getQuote(upperSymbol);
    const totalCost = shares * quote.price;
    const currentCash = await portfolio.getCash();

    if (totalCost > currentCash) {
      return c.json({
        error: 'Insufficient funds',
        required: totalCost.toFixed(2),
        available: currentCash.toFixed(2)
      }, 400);
    }

    await portfolio.buy(upperSymbol, shares, quote.price);

    return c.json({
      success: true,
      action: 'BUY',
      symbol: upperSymbol,
      shares,
      price: quote.price,
      total: totalCost.toFixed(2),
      remainingCash: (await portfolio.getCash()).toFixed(2)
    });
  } catch (error) {
    return c.json({
      error: 'Trade failed',
      message: error.message
    }, 400);
  }
});

// Sell stocks
trades.post('/sell', async (c) => {
  try {
    const db = c.get('db');
    const portfolio = new Portfolio(db);
    const stocks = new StockService();
    const { symbol, shares } = await c.req.json();

    if (!symbol || typeof symbol !== 'string') {
      return c.json({ error: 'Symbol is required and must be a string' }, 400);
    }

    if (!shares || typeof shares !== 'number' || shares <= 0) {
      return c.json({ error: 'Shares must be a positive number' }, 400);
    }

    const upperSymbol = symbol.toUpperCase();
    const position = await portfolio.getPositionBySymbol(upperSymbol);

    if (!position || position.shares < shares) {
      return c.json({
        error: 'Insufficient shares',
        requested: shares,
        available: position?.shares || 0
      }, 400);
    }

    const quote = await stocks.getQuote(upperSymbol);
    await portfolio.sell(upperSymbol, shares, quote.price);

    const totalProceeds = shares * quote.price;

    return c.json({
      success: true,
      action: 'SELL',
      symbol: upperSymbol,
      shares,
      price: quote.price,
      total: totalProceeds.toFixed(2),
      remainingCash: (await portfolio.getCash()).toFixed(2),
      remainingShares: position.shares - shares
    });
  } catch (error) {
    return c.json({
      error: 'Trade failed',
      message: error.message
    }, 400);
  }
});

// Get trade history
trades.get('/history', async (c) => {
  try {
    const db = c.get('db');
    const portfolio = new Portfolio(db);

    const trades = await portfolio.getTradeHistory();
    return c.json({
      trades,
      count: trades.length
    });
  } catch (error) {
    return c.json({
      error: 'Failed to fetch trade history',
      message: error.message
    }, 500);
  }
});

export default trades;