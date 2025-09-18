import TopPicksComponent from '../components/TopPicks';
import { Link } from 'react-router-dom';

function TopPicks() {
  return (
    <div>
      <div className="card">
        <h2>🌟 Top Small Cap Picks</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          AI-powered analysis of trending small & micro-cap stocks with buy/sell recommendations
        </p>
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Top picks are automatically loaded on the Dashboard. Click the Dashboard tab to view the latest AI-powered recommendations.
        </p>
        <Link to="/" className="btn" style={{ marginTop: '16px', textDecoration: 'none' }}>
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default TopPicks;