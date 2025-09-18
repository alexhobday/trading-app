# 🚀 Micro Cap Trading Platform

**AI-powered micro-cap stock trading platform built on Cloudflare Workers**

This is a modern, cloud-native version of the ChatGPT Micro-Cap Experiment, rebuilt as a serverless web application.

## ✨ Features

- **🤖 AI-Powered Trading** - Built for ChatGPT-driven trading decisions
- **📊 Real-Time Stock Data** - Live quotes via Yahoo Finance API
- **💾 D1 Database** - Serverless SQLite for portfolio tracking
- **🌐 Global Edge Deployment** - Runs on Cloudflare's edge network
- **📱 Responsive Web UI** - Beautiful, mobile-friendly interface
- **⚡ Zero Cold Starts** - Instant response times worldwide

## 🏗️ Architecture

- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Serverless edge computing

## 🚀 Quick Start

### Prerequisites
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Node.js 18+

### 1. Clone and Install
```bash
git clone <repo-url>
cd ChatGPT-Micro-Cap-Experiment
npm install
```

### 2. Set up Database
```bash
# Create D1 database
npm run db:create

# Update wrangler.toml with database ID from above command

# Initialize database schema
npm run db:init-local
```

### 3. Local Development
```bash
npm run dev
```

Open http://localhost:8787/app

### 4. Deploy to Production
```bash
# Initialize production database
npm run db:init

# Deploy to Cloudflare Workers
npm run deploy
```

## 📁 Project Structure

```
├── src/
│   ├── worker.js              # Main Cloudflare Worker
│   ├── lib/
│   │   ├── d1Portfolio.js     # D1 database portfolio management
│   │   └── workerStocks.js    # Yahoo Finance API integration
│   └── templates/
│       └── app.js             # HTML template renderer
├── python/                    # Original Python experiment
├── schema.sql                 # D1 database schema
├── wrangler.toml             # Cloudflare Workers config
└── package.json              # Dependencies and scripts
```

## 🔌 API Endpoints

### Portfolio Management
- `GET /api/portfolio` - Get portfolio summary with current prices
- `POST /api/portfolio/cash` - Set cash balance

### Trading
- `POST /api/trades/buy` - Buy stocks
- `POST /api/trades/sell` - Sell stocks
- `GET /api/trades/history` - Get trade history

### Stock Data
- `GET /api/stocks/quote/:symbol` - Get real-time quote
- `GET /api/stocks/search?q=query` - Search stocks
- `GET /api/stocks/history/:symbol` - Get historical data

### Web Interface
- `GET /app` - Trading web application

## 🛠️ Development

### Local Testing
```bash
# Start dev server
npm run dev

# Query local database
npm run db:query-local "SELECT * FROM portfolio"

# Reset local database
npm run db:init-local
```

### Database Management
```bash
# Production database commands
npm run db:query "SELECT * FROM trades ORDER BY timestamp DESC LIMIT 10"
npm run db:init  # Initialize production schema
```

## 🎯 Original Python Experiment

The original ChatGPT trading experiment is preserved in the `python/` directory. See `python/README.md` for details about the 6-month live trading experiment.

## 🚀 Deployment

This application deploys to Cloudflare Workers for:
- **Global Edge Distribution** - Sub-10ms response times worldwide
- **Automatic Scaling** - Handles traffic spikes seamlessly
- **Zero Infrastructure** - No servers to manage
- **Pay-per-Request** - Cost-effective serverless pricing

## 📊 Performance

- **Cold Start**: ~0ms (V8 Isolates)
- **Response Time**: <10ms globally
- **Uptime**: 99.99%+ (Cloudflare SLA)
- **Concurrency**: Unlimited

## 🔐 Security

- CORS configured for web access
- Input validation on all endpoints
- SQL injection protection via prepared statements
- No sensitive data in client-side code

## 📈 Monitoring

Access metrics via Cloudflare dashboard:
- Request volume and latency
- Error rates and status codes
- Database query performance
- Global traffic distribution

---

**Built with ❤️ using Cloudflare Workers and Hono.js**