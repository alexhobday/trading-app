import { useState, useEffect } from 'react';
import TopPicks from '../components/TopPicks';

function Dashboard({ portfolioData }) {
  const [messages, setMessages] = useState([]);

  return (
    <div>
      {messages.length > 0 && (
        <div id="messages">
          {messages.map((message, index) => (
            <div key={index} className={message.type}>
              {message.text}
            </div>
          ))}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${portfolioData.cash || '0.00'}</div>
          <div className="stat-label">Cash Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${portfolioData.totalPositionValue || '0.00'}</div>
          <div className="stat-label">Holdings Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${portfolioData.totalValue || '0.00'}</div>
          <div className="stat-label">Total Portfolio</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(portfolioData.positions || {}).length}</div>
          <div className="stat-label">Active Positions</div>
        </div>
      </div>

      <div className="dashboard-grid-wide">
        <TopPicks />
      </div>
    </div>
  );
}

export default Dashboard;