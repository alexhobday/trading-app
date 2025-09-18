import { Layout } from './layout.jsx';
import { Header, PortfolioSummary, CashForm, BuyForm, SellForm, StockSearch, StockQuote } from '../components/index.jsx';

export function HomePage(portfolioData) {
  return (
    <Layout title="Micro Cap Trader">
      <Header />

      <div id="messages"></div>

      <PortfolioSummary {...portfolioData} />

      <CashForm />

      <div class="grid">
        <BuyForm />
        <SellForm />
      </div>

      <StockSearch />

      <StockQuote />
    </Layout>
  );
}