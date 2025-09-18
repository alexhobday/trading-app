import { Layout } from './layout.jsx';
import { Header, PortfolioSummary, CashForm, BuyForm, SellForm, StockSearch, StockQuote, StockAnalysis, TopPicks } from '../components/index.jsx';

export function HomePage(portfolioData) {
  return (
    <Layout title="Micro Cap Trader">
      <div id="messages"></div>

      {/* Dashboard Section */}
      <div id="dashboard-section" class="content-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${portfolioData.cash || '0.00'}</div>
            <div class="stat-label">Cash Available</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${portfolioData.totalPositionValue || '0.00'}</div>
            <div class="stat-label">Holdings Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${portfolioData.totalValue || '0.00'}</div>
            <div class="stat-label">Total Portfolio</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{Object.keys(portfolioData.positions || {}).length}</div>
            <div class="stat-label">Active Positions</div>
          </div>
        </div>

        <div class="dashboard-grid-wide">
          <TopPicks />
        </div>
      </div>

      {/* Portfolio Holdings Section */}
      <div id="portfolio-section" class="content-section" style="display: none;">
        <PortfolioSummary {...portfolioData} />
        <CashForm />
      </div>

      {/* Trading Section */}
      <div id="trading-section" class="content-section" style="display: none;">
        <div class="dashboard-grid">
          <BuyForm />
          <SellForm />
        </div>
      </div>

      {/* Stock Analysis Section */}
      <div id="analysis-section" class="content-section" style="display: none;">
        <StockAnalysis />
      </div>

      {/* Stock Search Section */}
      <div id="search-section" class="content-section" style="display: none;">
        <StockSearch />
      </div>

      {/* Top Picks Section */}
      <div id="picks-section" class="content-section" style="display: none;">
        <div class="card">
          <h2>🌟 Top Small Cap Picks</h2>
          <p style="margin-bottom: 20px; color: #666;">
            AI-powered analysis of trending small & micro-cap stocks with buy/sell recommendations
          </p>
          <p style="color: #666; font-style: italic;">
            Top picks are automatically loaded on the Dashboard. Click the Dashboard tab to view the latest AI-powered recommendations.
          </p>
          <button onclick="showSection('dashboard')" class="btn" style="margin-top: 16px;">
            View Dashboard
          </button>
        </div>
      </div>

      {/* Quick Quote Section */}
      <div id="quotes-section" class="content-section" style="display: none;">
        <StockQuote />
      </div>
    </Layout>
  );
}