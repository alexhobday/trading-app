import { Hono } from 'hono';
import { Portfolio } from '../../models.js';
import { StockService } from '../../services.js';

const portfolio = new Hono();

// Get portfolio summary with current prices
portfolio.get('/', async (c) => {
  const db = c.get('db');
  const portfolioModel = new Portfolio(db);
  const stocks = new StockService();

  const positions = await portfolioModel.getPositions();
  const cash = await portfolioModel.getCash();

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

  const totalValue = cash + totalPositionValue;
  const history = await portfolioModel.getHistory();

  return c.json({
    cash: cash.toFixed(2),
    positions: positionValues,
    totalPositionValue: totalPositionValue.toFixed(2),
    totalValue: totalValue.toFixed(2),
    history: history.slice(0, 10)
  });
});

// Get positions only
portfolio.get('/positions', async (c) => {
  const db = c.get('db');
  const portfolioModel = new Portfolio(db);

  return c.json({
    positions: await portfolioModel.getPositions(),
    cash: await portfolioModel.getCash()
  });
});

// Get portfolio history
portfolio.get('/history', async (c) => {
  const db = c.get('db');
  const portfolioModel = new Portfolio(db);

  const history = await portfolioModel.getHistory();
  return c.json({
    history,
    count: history.length
  });
});

// Set cash amount
portfolio.post('/cash', async (c) => {
  try {
    const db = c.get('db');
    const portfolioModel = new Portfolio(db);

    let amount;
    const contentType = c.req.header('content-type');

    if (contentType?.includes('application/json')) {
      const body = await c.req.json();
      amount = body.amount;
    } else {
      const formData = await c.req.formData();
      amount = parseFloat(formData.get('amount'));
    }

    if (typeof amount !== 'number' || amount < 0) {
      const error = 'Invalid amount. Must be a positive number.';
      return contentType?.includes('application/json')
        ? c.json({ error }, 400)
        : c.html(`<div class="error">${error}</div>`);
    }

    await portfolioModel.setCash(amount);

    const success = `✅ Cash balance set to $${amount.toFixed(2)}. Refresh to see changes.`;
    return contentType?.includes('application/json')
      ? c.json({ success: true, cash: amount.toFixed(2) })
      : c.html(`<div class="success">${success}</div>`);
  } catch (error) {
    const errorMsg = `Error: ${error.message}`;
    const contentType = c.req.header('content-type');
    return contentType?.includes('application/json')
      ? c.json({ error: errorMsg }, 400)
      : c.html(`<div class="error">${errorMsg}</div>`);
  }
});

export default portfolio;