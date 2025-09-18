export function Layout({ title, children }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <script src="https://unpkg.com/htmx.org@2.0.2"></script>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .header p {
            color: #666;
            font-size: 1.1rem;
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          .card h2 {
            margin-bottom: 20px;
            color: #333;
            font-size: 1.5rem;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
          }
          .btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          }
          .btn-success { background: linear-gradient(45deg, #56ab2f, #a8e6cf); }
          .btn-danger { background: linear-gradient(45deg, #ff416c, #ff4b2b); }
          .input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 1rem;
            margin-bottom: 15px;
            transition: border-color 0.3s;
          }
          .input:focus {
            outline: none;
            border-color: #667eea;
          }
          .cash { font-size: 2rem; font-weight: bold; color: #27ae60; }
          .position {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-bottom: 10px;
          }
          .positive { color: #27ae60; }
          .negative { color: #e74c3c; }
          .error {
            background: #fff5f5;
            color: #e53e3e;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #e53e3e;
            margin-bottom: 20px;
          }
          .success {
            background: #f0fff4;
            color: #38a169;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #38a169;
            margin-bottom: 20px;
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          {children}
        </div>
      </body>
    </html>
  );
}