export class AIAnalysisService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async analyzeStockWithAI(stockData, historicalData) {
    if (!this.apiKey || this.apiKey === 'your-openai-api-key-here') {
      // Fallback to rule-based analysis if no API key
      return this.generateFallbackAnalysis(stockData, historicalData);
    }

    try {
      const prompt = this.buildAnalysisPrompt(stockData, historicalData);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert financial analyst specializing in micro-cap and small-cap stocks.
              Provide detailed analysis focusing on:
              1. Technical indicators and patterns
              2. Risk assessment for small/micro-cap investments
              3. Specific actionable trading recommendations
              4. Market conditions and timing
              5. Position sizing suggestions for volatile small caps

              Always structure your response as JSON with the following format:
              {
                "summary": "Brief 2-3 sentence summary",
                "recommendation": "BUY|SELL|HOLD",
                "confidence": "HIGH|MODERATE|LOW",
                "reasoning": "Detailed reasoning (100-150 words)",
                "riskLevel": "LOW|MODERATE|HIGH|VERY_HIGH",
                "targetPrice": number or null,
                "stopLoss": number or null,
                "positionSize": "SMALL|MODERATE|LARGE",
                "timeHorizon": "SHORT|MEDIUM|LONG",
                "keyFactors": ["factor1", "factor2", "factor3"],
                "risks": ["risk1", "risk2", "risk3"]
              }`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiAnalysis = JSON.parse(data.choices[0].message.content);

      return this.formatAIAnalysis(aiAnalysis);
    } catch (error) {
      console.error('AI Analysis failed:', error.message);
      return this.generateFallbackAnalysis(stockData, historicalData);
    }
  }

  buildAnalysisPrompt(stockData, historicalData) {
    const recentPrices = historicalData.slice(-30).map(d => d.close);
    const volumes = historicalData.slice(-30).map(d => d.volume);
    const priceChange30d = ((stockData.price - recentPrices[0]) / recentPrices[0] * 100).toFixed(2);

    return `Analyze this micro-cap stock for investment potential:

STOCK: ${stockData.symbol} - ${stockData.name}
CURRENT PRICE: $${stockData.price}
MARKET CAP: Small/Micro-cap
30-DAY CHANGE: ${priceChange30d}%
TODAY'S CHANGE: ${stockData.changePercent}%

TECHNICAL DATA:
- Recent 30-day prices: ${recentPrices.slice(-10).join(', ')}
- Average volume (30d): ${(volumes.reduce((a, b) => a + b, 0) / volumes.length).toLocaleString()}
- Current volume: ${stockData.volume?.toLocaleString() || 'N/A'}
- Price volatility: High (typical for micro-caps)

HISTORICAL PATTERNS:
- Highest (30d): $${Math.max(...recentPrices).toFixed(2)}
- Lowest (30d): $${Math.min(...recentPrices).toFixed(2)}
- Trend: ${recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'Upward' : 'Downward'}

Please provide a comprehensive analysis focusing on the unique characteristics and risks of micro-cap investing.`;
  }

  formatAIAnalysis(aiAnalysis) {
    return {
      aiInsights: {
        summary: aiAnalysis.summary,
        reasoning: aiAnalysis.reasoning,
        keyFactors: aiAnalysis.keyFactors || [],
        risks: aiAnalysis.risks || []
      },
      recommendation: {
        action: aiAnalysis.recommendation,
        confidence: aiAnalysis.confidence,
        reasoning: aiAnalysis.reasoning
      },
      trading: {
        targetPrice: aiAnalysis.targetPrice,
        stopLoss: aiAnalysis.stopLoss,
        positionSize: aiAnalysis.positionSize,
        timeHorizon: aiAnalysis.timeHorizon,
        riskLevel: aiAnalysis.riskLevel
      },
      timestamp: new Date().toISOString()
    };
  }

  generateFallbackAnalysis(stockData, historicalData) {
    const recentPrices = historicalData.slice(-30).map(d => d.close);
    const volatility = this.calculateVolatility(recentPrices);
    const trend = this.determineTrend(recentPrices);

    let recommendation = 'HOLD';
    let confidence = 'LOW';
    let riskLevel = 'HIGH'; // Default for micro-caps

    if (trend === 'STRONG_UP' && volatility < 0.4) {
      recommendation = 'BUY';
      confidence = 'MODERATE';
    } else if (trend === 'STRONG_DOWN' || volatility > 0.6) {
      recommendation = 'SELL';
      confidence = 'MODERATE';
    }

    return {
      aiInsights: {
        summary: `${stockData.symbol} shows ${trend.toLowerCase().replace('_', ' ')} trend with ${volatility > 0.4 ? 'high' : 'moderate'} volatility typical of micro-cap stocks.`,
        reasoning: `Based on technical analysis of recent price action. Micro-cap stocks carry inherent risks including low liquidity, high volatility, and limited institutional coverage. Consider position sizing carefully.`,
        keyFactors: ['Technical trend', 'Price volatility', 'Micro-cap liquidity risks'],
        risks: ['High volatility', 'Low liquidity', 'Limited institutional coverage', 'Regulatory risks']
      },
      recommendation: {
        action: recommendation,
        confidence: confidence,
        reasoning: 'Technical analysis-based recommendation for micro-cap investment'
      },
      trading: {
        targetPrice: null,
        stopLoss: recommendation === 'BUY' ? stockData.price * 0.85 : null,
        positionSize: 'SMALL',
        timeHorizon: 'MEDIUM',
        riskLevel: riskLevel
      },
      timestamp: new Date().toISOString()
    };
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  determineTrend(prices) {
    if (prices.length < 10) return 'NEUTRAL';

    const recent = prices.slice(-10);
    const early = prices.slice(-20, -10);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;

    const change = (recentAvg - earlyAvg) / earlyAvg;

    if (change > 0.1) return 'STRONG_UP';
    if (change > 0.03) return 'UP';
    if (change < -0.1) return 'STRONG_DOWN';
    if (change < -0.03) return 'DOWN';
    return 'NEUTRAL';
  }

  // Get small/micro-cap stock recommendations
  getSmallCapWatchlist() {
    // Curated list of valid small-cap stocks with good liquidity
    return [
      'UPST', 'OPEN', 'SOFI', 'PLTR', 'CRSP', 'EDIT', 'BEAM', 'NTLA',
      'MRSN', 'DVAX', 'VKTX', 'MRNA', 'ROKU', 'HOOD', 'COIN', 'SNOW'
    ];
  }
}