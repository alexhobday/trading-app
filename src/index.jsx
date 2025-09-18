import { Hono } from 'hono';

import { corsMiddleware, errorHandler, databaseMiddleware } from './middleware/index.js';
import { api, health } from './routes/index.js';
import { HomePage } from './views/home.jsx';
import { Portfolio } from './models/index.js';
import { StockService } from './services/index.js';

const app = new Hono();

// Apply middleware
app.use('*', corsMiddleware);
app.use('*', databaseMiddleware);
app.onError(errorHandler);


// Mount routes
app.route('/health', health);
app.route('/api', api);



// Main web app
app.get('/', async (c) => {
  const db = c.get('db');
  const portfolio = new Portfolio(db);
  const stocks = new StockService();

  try {
    const positions = await portfolio.getPositions();
    const cash = await portfolio.getCash();

    // Get current prices for positions
    const positionValues = {};
    let totalPositionValue = 0;

    for (const [symbol, shares] of Object.entries(positions)) {
      try {
        const quote = await stocks.getQuote(symbol);
        const value = shares * quote.price;
        positionValues[symbol] = {
          shares,
          price: quote.price,
          value: value.toFixed(2),
          change: quote.changePercent
        };
        totalPositionValue += value;
      } catch (error) {
        positionValues[symbol] = {
          shares,
          price: 0,
          value: '0.00',
          change: 0,
          error: error.message
        };
      }
    }

    const totalValue = (cash + totalPositionValue).toFixed(2);

    return c.html(HomePage({
      cash: cash.toFixed(2),
      positions: positionValues,
      totalValue
    }));
  } catch (error) {
    return c.html(HomePage({
      cash: '0.00',
      positions: {},
      totalValue: '0.00',
      error: error.message
    }));
  }
});







// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    available_endpoints: [
      'GET / (Web App)',
      'GET /health (API Documentation)',
      'GET /api/portfolio',
      'GET /api/stocks/quote/:symbol',
      'POST /api/trades/buy',
      'POST /api/trades/sell'
    ]
  }, 404);
});

export default app;