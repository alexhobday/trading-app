import { Hono } from 'hono';
import { StockService } from '../../services.js';

const stocks = new Hono();

// Get stock quote
stocks.get('/quote/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  const stockService = new StockService();

  try {
    const quote = await stockService.getQuote(symbol);
    return c.json(quote);
  } catch (error) {
    return c.json({
      error: `Unable to fetch quote for ${symbol}`,
      message: error.message
    }, 404);
  }
});

// Get multiple quotes
stocks.post('/quotes', async (c) => {
  try {
    const { symbols } = await c.req.json();
    const stockService = new StockService();

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return c.json({ error: 'Please provide an array of symbols' }, 400);
    }

    const quotes = await stockService.getMultipleQuotes(symbols);
    return c.json(quotes);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// Search stocks
stocks.get('/search', async (c) => {
  const query = c.req.query('q');
  const stockService = new StockService();

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  if (query.length < 2) {
    return c.json({
      query,
      results: [],
      count: 0
    });
  }

  try {
    const results = await stockService.searchSymbol(query);
    return c.json({
      query,
      results,
      count: results.length
    });
  } catch (error) {
    return c.json({
      error: 'Search failed',
      message: error.message
    }, 500);
  }
});

// Get historical data
stocks.get('/history/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  const days = parseInt(c.req.query('days') || '30');
  const stockService = new StockService();

  try {
    const data = await stockService.getHistoricalData(symbol, days);
    return c.json({
      symbol,
      days,
      data,
      count: data.length
    });
  } catch (error) {
    return c.json({
      error: `Unable to fetch history for ${symbol}`,
      message: error.message
    }, 404);
  }
});

// Get stock quote for HTML forms
stocks.get('/quote-html', async (c) => {
  const symbol = c.req.query('symbol')?.toUpperCase();

  if (!symbol) {
    return c.html('<div class="error">Symbol is required</div>');
  }

  try {
    const stockService = new StockService();
    const quote = await stockService.getQuote(symbol);

    return c.html(`
      <div style="margin-top: 20px;">
        <div class="position">
          <div>
            <strong>${quote.symbol}</strong>
            <div style="font-size: 0.9rem; color: #666;">${quote.name}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.2rem; font-weight: bold;">$${quote.price}</div>
            <div class="${(quote.change || 0) >= 0 ? 'positive' : 'negative'}">
              ${(quote.change || 0) >= 0 ? '+' : ''}$${(quote.change || 0).toFixed(2)} (${(quote.change || 0) >= 0 ? '+' : ''}${(quote.changePercent || 0).toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>
    `);
  } catch (error) {
    return c.html(`<div class="error">Failed to get quote: ${error.message}</div>`);
  }
});

export default stocks;