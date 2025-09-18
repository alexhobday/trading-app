import { Hono } from 'hono';
import { StockService, StockAnalysisService } from '../../services.js';

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

// Get stock analysis and tips
stocks.get('/analyze/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();

  try {
    const stockService = new StockService();
    const analysisService = new StockAnalysisService(stockService);

    const analysis = await analysisService.analyzeStock(symbol);
    return c.json(analysis);
  } catch (error) {
    return c.json({
      error: `Unable to analyze ${symbol}`,
      message: error.message
    }, 404);
  }
});

// Get top stock picks with analysis
stocks.get('/top-picks', async (c) => {
  try {
    const stockService = new StockService();
    const analysisService = new StockAnalysisService(stockService);

    const topPicks = await analysisService.getTopPicks();
    return c.json({
      timestamp: new Date().toISOString(),
      count: topPicks.length,
      picks: topPicks
    });
  } catch (error) {
    return c.json({
      error: 'Unable to get top picks',
      message: error.message
    }, 500);
  }
});

// Get stock analysis for HTML display
stocks.get('/analyze-html', async (c) => {
  const symbol = c.req.query('symbol')?.toUpperCase();

  if (!symbol) {
    return c.html('<div class="error">Symbol is required</div>');
  }

  try {
    const stockService = new StockService();
    const analysisService = new StockAnalysisService(stockService);
    const analysis = await analysisService.analyzeStock(symbol);

    const signalsHtml = analysis.signals.map(signal => {
      const colorClass = signal.type === 'bullish' ? 'positive' :
                        signal.type === 'bearish' ? 'negative' : 'neutral';
      return `<div class="${colorClass}" style="margin: 5px 0; font-size: 0.9rem;">
        ${signal.message}
      </div>`;
    }).join('');

    const tipsHtml = analysis.tips.map(tip => {
      const icon = tip.type === 'buy' ? '📈' : tip.type === 'sell' ? '📉' :
                  tip.type === 'warning' ? '⚠️' : 'ℹ️';
      return `<div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px; font-size: 0.9rem;">
        ${icon} ${tip.message}
      </div>`;
    }).join('');

    const recColor = analysis.recommendation.action === 'BUY' ? 'positive' :
                    analysis.recommendation.action === 'SELL' ? 'negative' : 'neutral';

    return c.html(`
      <div style="margin-top: 20px;">
        <div class="position" style="flex-direction: column; align-items: stretch;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
              <strong>${analysis.symbol}</strong>
              <div style="font-size: 0.9rem; color: #666;">${analysis.name}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.2rem; font-weight: bold;">$${analysis.currentPrice}</div>
              <div class="${analysis.changePercent >= 0 ? 'positive' : 'negative'}">
                ${analysis.changePercent >= 0 ? '+' : ''}${analysis.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid #e1e5e9; padding-top: 15px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px;">📊 Technical Analysis</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; font-size: 0.9rem;">
              ${analysis.analysis.sma20 ? `<div><strong>MA20:</strong> $${analysis.analysis.sma20}</div>` : ''}
              ${analysis.analysis.sma50 ? `<div><strong>MA50:</strong> $${analysis.analysis.sma50}</div>` : ''}
              ${analysis.analysis.rsi ? `<div><strong>RSI:</strong> ${analysis.analysis.rsi}</div>` : ''}
              ${analysis.analysis.volatility ? `<div><strong>Volatility:</strong> ${analysis.analysis.volatility}</div>` : ''}
            </div>
          </div>

          <div style="border-top: 1px solid #e1e5e9; padding-top: 15px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px;">🎯 Recommendation</h4>
            <div class="${recColor}" style="font-weight: bold; font-size: 1.1rem;">
              ${analysis.recommendation.action} - ${analysis.recommendation.confidence} confidence
            </div>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
              ${analysis.recommendation.reason}
            </div>
          </div>

          ${analysis.signals.length > 0 ? `
          <div style="border-top: 1px solid #e1e5e9; padding-top: 15px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px;">📈 Signals</h4>
            ${signalsHtml}
          </div>
          ` : ''}

          ${analysis.tips.length > 0 ? `
          <div style="border-top: 1px solid #e1e5e9; padding-top: 15px;">
            <h4 style="margin-bottom: 10px;">💡 Tips</h4>
            ${tipsHtml}
          </div>
          ` : ''}
        </div>
      </div>
    `);
  } catch (error) {
    return c.html(`<div class="error">Failed to analyze stock: ${error.message}</div>`);
  }
});

export default stocks;