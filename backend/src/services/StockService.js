export class WorkerStockService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Use Yahoo Finance API directly (since yahoo-finance2 won't work in Workers)
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart.result[0];

      if (!result || !result.meta) {
        throw new Error('Invalid response format');
      }

      const meta = result.meta;
      const quotes = result.indicators.quote[0];
      const latestIndex = quotes.close.length - 1;

      const quote = {
        symbol: meta.symbol,
        price: meta.regularMarketPrice || quotes.close[latestIndex],
        previousClose: meta.previousClose,
        change: meta.regularMarketPrice - meta.previousClose,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap,
        name: meta.longName || meta.shortName || symbol
      };

      this.cache.set(cacheKey, { data: quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error.message);
      throw new Error(`Unable to fetch stock price for ${symbol}`);
    }
  }

  async getMultipleQuotes(symbols) {
    const quotes = await Promise.allSettled(
      symbols.map(symbol => this.getQuote(symbol))
    );

    return quotes
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }

  async searchSymbol(query) {
    try {
      const response = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=6&newsCount=0`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return data.quotes
        .filter(q => q.quoteType === 'EQUITY')
        .slice(0, 5)
        .map(q => ({
          symbol: q.symbol,
          name: q.shortname || q.longname,
          exchange: q.exchange,
          type: q.quoteType
        }));
    } catch (error) {
      console.error('Search failed:', error.message);
      return [];
    }
  }

  async getHistoricalData(symbol, days = 30) {
    try {
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (days * 24 * 60 * 60);

      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startTime}&period2=${endTime}&interval=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart.result[0];

      if (!result || !result.timestamp) {
        return [];
      }

      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      return timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index]
      })).filter(q => q.close !== null);
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error.message);
      return [];
    }
  }
}