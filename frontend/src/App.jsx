import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Analysis from './pages/Analysis';
import Search from './pages/Search';
import TopPicks from './pages/TopPicks';
import Quotes from './pages/Quotes';

function App() {
  const [portfolioData, setPortfolioData] = useState({
    cash: '0.00',
    totalPositionValue: '0.00',
    totalValue: '0.00',
    positions: {}
  });

  useEffect(() => {
    // Load portfolio data from backend
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('http://localhost:8787/api/portfolio');
        if (response.ok) {
          const data = await response.json();
          setPortfolioData(data);
        }
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      }
    };

    fetchPortfolioData();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard portfolioData={portfolioData} />} />
          <Route path="/portfolio" element={<Portfolio portfolioData={portfolioData} />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/search" element={<Search />} />
          <Route path="/picks" element={<TopPicks />} />
          <Route path="/quotes" element={<Quotes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
