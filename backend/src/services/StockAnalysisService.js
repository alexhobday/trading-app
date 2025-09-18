import { AIAnalysisService } from './AIAnalysisService.js';

export class StockAnalysisService {
  constructor(stockService, openaiApiKey = null) {
    this.stockService = stockService;
    this.aiService = new AIAnalysisService(openaiApiKey);
  }

  // Calculate technical indicators
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RS and RSI
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return null;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }

  // Generate AI-powered stock analysis and tips for small caps
  async analyzeStock(symbol) {
    try {
      const quote = await this.stockService.getQuote(symbol);
      const historicalData = await this.stockService.getHistoricalData(symbol, 60); // Get more data for better AI analysis

      if (!historicalData || historicalData.length < 20) {
        throw new Error('Insufficient historical data for analysis');
      }

      const prices = historicalData.map(d => d.close);
      const volumes = historicalData.map(d => d.volume);

      // Calculate technical indicators
      const sma20 = this.calculateSMA(prices, 20);
      const sma50 = this.calculateSMA(prices, Math.min(50, prices.length));
      const rsi = this.calculateRSI(prices);
      const volatility = this.calculateVolatility(prices);
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

      // Current metrics
      const currentPrice = quote.price;
      const currentVolume = quote.volume;
      const changePercent = quote.changePercent;

      // Generate traditional signals and tips
      const signals = this.generateSignals({
        currentPrice,
        sma20,
        sma50,
        rsi,
        volatility,
        changePercent,
        currentVolume,
        avgVolume
      });

      const tips = this.generateTips(signals, {
        symbol: quote.symbol,
        name: quote.name,
        currentPrice,
        changePercent,
        volatility
      });

      // Get AI-powered analysis
      const aiAnalysis = await this.aiService.analyzeStockWithAI(quote, historicalData);

      return {
        symbol: quote.symbol,
        name: quote.name,
        currentPrice,
        changePercent: changePercent || quote.changePercent || 0,
        analysis: {
          sma20: sma20?.toFixed(2),
          sma50: sma50?.toFixed(2),
          rsi: rsi?.toFixed(2),
          volatility: (volatility * 100)?.toFixed(2) + '%',
          volumeRatio: (currentVolume / avgVolume).toFixed(2)
        },
        signals,
        tips,
        recommendation: aiAnalysis.recommendation || this.getOverallRecommendation(signals),
        aiInsights: aiAnalysis.aiInsights,
        trading: aiAnalysis.trading,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Analysis failed for ${symbol}:`, error.message);
      throw new Error(`Unable to analyze ${symbol}: ${error.message}`);
    }
  }

  generateSignals(indicators) {
    const signals = [];
    const { currentPrice, sma20, sma50, rsi, volatility, changePercent, currentVolume, avgVolume } = indicators;

    // Moving Average signals
    if (sma20 && sma50) {
      if (currentPrice > sma20 && sma20 > sma50) {
        signals.push({ type: 'bullish', indicator: 'moving_average', strength: 'strong', message: 'Price above both MA20 and MA50 - Strong uptrend' });
      } else if (currentPrice > sma20) {
        signals.push({ type: 'bullish', indicator: 'moving_average', strength: 'moderate', message: 'Price above MA20 - Short-term bullish' });
      } else if (currentPrice < sma20 && sma20 < sma50) {
        signals.push({ type: 'bearish', indicator: 'moving_average', strength: 'strong', message: 'Price below both MAs - Strong downtrend' });
      }
    }

    // RSI signals
    if (rsi) {
      if (rsi > 70) {
        signals.push({ type: 'bearish', indicator: 'rsi', strength: 'moderate', message: `RSI ${rsi.toFixed(1)} - Potentially overbought` });
      } else if (rsi < 30) {
        signals.push({ type: 'bullish', indicator: 'rsi', strength: 'moderate', message: `RSI ${rsi.toFixed(1)} - Potentially oversold` });
      } else if (rsi >= 45 && rsi <= 55) {
        signals.push({ type: 'neutral', indicator: 'rsi', strength: 'weak', message: `RSI ${rsi.toFixed(1)} - Neutral momentum` });
      }
    }

    // Volume signals
    if (currentVolume / avgVolume > 1.5) {
      const volumeType = changePercent > 0 ? 'bullish' : 'bearish';
      signals.push({
        type: volumeType,
        indicator: 'volume',
        strength: 'moderate',
        message: `High volume (${(currentVolume / avgVolume).toFixed(1)}x avg) confirms price movement`
      });
    }

    // Volatility signals
    if (volatility > 0.4) {
      signals.push({ type: 'warning', indicator: 'volatility', strength: 'high', message: `High volatility (${(volatility * 100).toFixed(1)}%) - Increased risk` });
    }

    return signals;
  }

  generateTips(signals, stockInfo) {
    const tips = [];
    const { symbol, name, currentPrice, changePercent, volatility } = stockInfo;

    // General tips based on signals
    const bullishSignals = signals.filter(s => s.type === 'bullish').length;
    const bearishSignals = signals.filter(s => s.type === 'bearish').length;
    const strongSignals = signals.filter(s => s.strength === 'strong').length;

    if (bullishSignals > bearishSignals && strongSignals > 0) {
      tips.push({
        category: 'entry',
        type: 'buy',
        message: `Consider ${symbol} for a long position. Multiple bullish indicators suggest upward momentum.`,
        confidence: 'moderate'
      });
    } else if (bearishSignals > bullishSignals && strongSignals > 0) {
      tips.push({
        category: 'exit',
        type: 'sell',
        message: `Consider reducing ${symbol} position. Bearish signals indicate potential downside.`,
        confidence: 'moderate'
      });
    }

    // Risk management tips
    if (volatility > 0.3) {
      tips.push({
        category: 'risk',
        type: 'warning',
        message: `${symbol} shows high volatility. Consider smaller position sizes and tighter stop losses.`,
        confidence: 'high'
      });
    }

    // Price action tips
    if (Math.abs(changePercent) > 5) {
      const direction = changePercent > 0 ? 'surge' : 'drop';
      tips.push({
        category: 'timing',
        type: 'info',
        message: `${symbol} experienced a ${Math.abs(changePercent).toFixed(1)}% ${direction} today. Wait for consolidation before entering.`,
        confidence: 'moderate'
      });
    }

    // Default tip if no specific signals
    if (tips.length === 0) {
      tips.push({
        category: 'general',
        type: 'info',
        message: `${symbol} shows neutral signals. Monitor for clearer directional indicators before taking action.`,
        confidence: 'low'
      });
    }

    return tips;
  }

  getOverallRecommendation(signals) {
    const bullishSignals = signals.filter(s => s.type === 'bullish');
    const bearishSignals = signals.filter(s => s.type === 'bearish');
    const strongBullish = bullishSignals.filter(s => s.strength === 'strong').length;
    const strongBearish = bearishSignals.filter(s => s.strength === 'strong').length;

    if (strongBullish > 0 && strongBearish === 0) {
      return { action: 'BUY', confidence: 'HIGH', reason: 'Strong bullish signals detected' };
    } else if (bullishSignals.length > bearishSignals.length + 1) {
      return { action: 'BUY', confidence: 'MODERATE', reason: 'Multiple bullish indicators' };
    } else if (strongBearish > 0 && strongBullish === 0) {
      return { action: 'SELL', confidence: 'HIGH', reason: 'Strong bearish signals detected' };
    } else if (bearishSignals.length > bullishSignals.length + 1) {
      return { action: 'SELL', confidence: 'MODERATE', reason: 'Multiple bearish indicators' };
    } else {
      return { action: 'HOLD', confidence: 'LOW', reason: 'Mixed or insufficient signals' };
    }
  }

  // Get top performing small/micro cap stocks from a watchlist
  async getTopPicks(symbols = null) {
    if (!symbols) {
      symbols = this.aiService.getSmallCapWatchlist();
    }
    try {
      // Add delays between API calls to avoid rate limiting
      const analyses = [];
      for (let i = 0; i < Math.min(symbols.length, 5); i++) {
        try {
          const analysis = await this.analyzeStock(symbols[i]);
          analyses.push({ status: 'fulfilled', value: analysis });
        } catch (error) {
          analyses.push({ status: 'rejected', reason: error });
        }
        // Longer delay between calls to avoid rate limiting
        if (i < 4) await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const validAnalyses = analyses
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      // Sort by recommendation confidence and bullish signals
      return validAnalyses
        .sort((a, b) => {
          const aScore = this.getPickScore(a);
          const bScore = this.getPickScore(b);
          return bScore - aScore;
        })
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to get top picks:', error.message);
      return [];
    }
  }

  getPickScore(analysis) {
    let score = 0;
    const { recommendation, signals } = analysis;

    // Base score from recommendation
    if (recommendation.action === 'BUY') {
      score += recommendation.confidence === 'HIGH' ? 100 : 50;
    } else if (recommendation.action === 'SELL') {
      score -= recommendation.confidence === 'HIGH' ? 100 : 50;
    }

    // Bonus for bullish signals
    const bullishSignals = signals.filter(s => s.type === 'bullish');
    score += bullishSignals.length * 10;

    // Penalty for bearish signals
    const bearishSignals = signals.filter(s => s.type === 'bearish');
    score -= bearishSignals.length * 10;

    return score;
  }
}