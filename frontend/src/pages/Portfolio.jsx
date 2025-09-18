import PortfolioSummary from '../components/PortfolioSummary';
import CashForm from '../components/CashForm';

function Portfolio({ portfolioData }) {
  return (
    <div>
      <PortfolioSummary {...portfolioData} />
      <CashForm />
    </div>
  );
}

export default Portfolio;