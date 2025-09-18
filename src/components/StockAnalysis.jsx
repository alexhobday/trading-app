export function StockAnalysis() {
  return (
    <div class="card">
      <h2>📊 Stock Analysis & Tips</h2>
      <form hx-get="/api/stocks/analyze-html" hx-target="#analysis-result" hx-trigger="submit">
        <input
          type="text"
          name="symbol"
          placeholder="Stock Symbol (e.g., AAPL)"
          class="input"
          required
          style="text-transform: uppercase;"
        />
        <button type="submit" class="btn">Analyze Stock</button>
      </form>
      <div id="analysis-result"></div>
    </div>
  );
}

export function TopPicks() {
  return (
    <div class="card">
      <h2>🌟 Top Stock Picks</h2>
      <p style="margin-bottom: 20px; color: #666;">
        AI-powered analysis of trending stocks with buy/sell recommendations
      </p>
      <button
        hx-get="/api/stocks/top-picks"
        hx-target="#top-picks-result"
        hx-trigger="click"
        class="btn"
      >
        Get Latest Picks
      </button>
      <div id="top-picks-result"></div>

      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', function() {
          // Auto-load top picks on page load
          setTimeout(() => {
            const button = document.querySelector('[hx-target="#top-picks-result"]');
            if (button) {
              button.click();
            }
          }, 1000);

          // Handle top picks response
          document.body.addEventListener('htmx:afterRequest', function(event) {
            if (event.detail.target?.id === 'top-picks-result') {
              if (event.detail.xhr.status === 200) {
                try {
                  const response = JSON.parse(event.detail.xhr.responseText);
                  console.log('Top picks response:', response);
                  if (response.picks && response.picks.length > 0) {
                  const html = \`
                    <div style="margin-top: 20px;">
                      <div style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">
                        Updated: \${new Date(response.timestamp).toLocaleString()}
                      </div>
                      \${response.picks.map((pick, index) => {
                        const recColor = pick.recommendation.action === 'BUY' ? 'positive' :
                                        pick.recommendation.action === 'SELL' ? 'negative' : 'neutral';
                        const badge = pick.recommendation.action === 'BUY' ? '🚀' :
                                     pick.recommendation.action === 'SELL' ? '📉' : '⏸️';

                        return \`
                          <div class="position" style="margin-bottom: 15px;">
                            <div>
                              <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2rem;">\${badge}</span>
                                <strong>\${pick.symbol}</strong>
                                <span class="\${recColor}" style="font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; background: \${pick.recommendation.action === 'BUY' ? '#e8f5e8' : pick.recommendation.action === 'SELL' ? '#ffeaea' : '#f0f0f0'};">
                                  \${pick.recommendation.action}
                                </span>
                              </div>
                              <div style="font-size: 0.9rem; color: #666; margin-top: 4px;">
                                \${pick.name}
                              </div>
                              <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">
                                \${pick.recommendation.reason}
                              </div>
                            </div>
                            <div style="text-align: right;">
                              <div style="font-weight: bold;">$\${pick.currentPrice}</div>
                              <div class="\${(pick.changePercent || 0) >= 0 ? 'positive' : 'negative'}" style="font-size: 0.9rem;">
                                \${(pick.changePercent || 0) >= 0 ? '+' : ''}\${(pick.changePercent || 0).toFixed(2)}%
                              </div>
                              <div style="font-size: 0.8rem; color: #666;">
                                \${pick.recommendation.confidence} confidence
                              </div>
                            </div>
                          </div>
                        \`;
                      }).join('')}
                    </div>
                  \`;
                  event.detail.target.innerHTML = html;
                  } else {
                    event.detail.target.innerHTML = '<div style="margin-top: 20px; color: #666;">No picks available at the moment.</div>';
                  }
                } catch (error) {
                  console.error('Failed to parse top picks:', error);
                  event.detail.target.innerHTML = '<div class="error" style="margin-top: 20px;">Failed to parse top picks response.</div>';
                }
              } else {
                console.error('Top picks request failed:', event.detail.xhr.status, event.detail.xhr.responseText);
                event.detail.target.innerHTML = \`<div class="error" style="margin-top: 20px;">Failed to load top picks (Status: \${event.detail.xhr.status}).</div>\`;
              }
            }
          });
        });
      `}} />
    </div>
  );
}