import { Hono } from 'hono';

const health = new Hono();

// Health check and API documentation
health.get('/', (c) => {
  return c.json({
    status: 'ok',
    name: 'Micro Cap Trading API',
    version: '2.0.0',
    environment: 'Cloudflare Workers',
    endpoints: {
      portfolio: {
        summary: 'GET /api/portfolio',
        positions: 'GET /api/portfolio/positions',
        history: 'GET /api/portfolio/history',
        setCash: 'POST /api/portfolio/cash'
      },
      stocks: {
        quote: 'GET /api/stocks/quote/:symbol',
        quotes: 'POST /api/stocks/quotes',
        search: 'GET /api/stocks/search?q=query',
        history: 'GET /api/stocks/history/:symbol',
        quoteHtml: 'GET /api/stocks/quote-html'
      },
      trades: {
        buy: 'POST /api/trades/buy',
        sell: 'POST /api/trades/sell',
        history: 'GET /api/trades/history'
      }
    }
  });
});

export default health;