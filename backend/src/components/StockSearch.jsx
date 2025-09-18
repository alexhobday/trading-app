export function StockSearch() {
  return (
    <div class="card">
      <h2>🔍 Search Stocks</h2>
      <input id="search-input"
             type="text"
             placeholder="Search for stocks (e.g., Apple, TSLA)"
             class="input" />
      <div id="search-results"></div>

      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', function() {
          let searchTimeout;
          const searchInput = document.getElementById('search-input');
          const searchResults = document.getElementById('search-results');

          if (searchInput) {
            searchInput.addEventListener('input', function(e) {
              clearTimeout(searchTimeout);
              const query = e.target.value;

              if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
              }

              searchTimeout = setTimeout(async () => {
                try {
                  const response = await fetch(\`/api/stocks/search?q=\${encodeURIComponent(query)}\`);
                  const data = await response.json();

                  if (data.error) {
                    searchResults.innerHTML =
                      \`<div class="error">Search failed: \${data.message || data.error}</div>\`;
                    return;
                  }

                  if (data.results.length === 0) {
                    searchResults.innerHTML =
                      '<div style="margin-top: 15px; color: #666;">No results found</div>';
                    return;
                  }

                  const html = \`
                    <div style="margin-top: 15px;">
                      <h4>Search Results:</h4>
                      \${data.results.map(stock => \`
                        <div class="position">
                          <div>
                            <strong>\${stock.symbol}</strong>
                            <div style="font-size: 0.9rem; color: #666;">\${stock.name}</div>
                          </div>
                          <div style="font-size: 0.9rem; color: #666;">\${stock.exchange}</div>
                        </div>
                      \`).join('')}
                    </div>
                  \`;

                  searchResults.innerHTML = html;
                } catch (error) {
                  searchResults.innerHTML =
                    \`<div class="error">Search failed: \${error.message}</div>\`;
                }
              }, 500);
            });
          }
        });
      `}} />
    </div>
  );
}

export function StockQuote() {
  return (
    <div class="card">
      <h2>💹 Get Stock Quote</h2>
      <form hx-get="/api/stocks/quote-html" hx-target="#quote-result" hx-trigger="submit">
        <input type="text" name="symbol" placeholder="Stock Symbol (e.g., AAPL)" class="input" required style="text-transform: uppercase;" />
        <button type="submit" class="btn">Get Quote</button>
      </form>
      <div id="quote-result"></div>
    </div>
  );
}