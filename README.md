# BSC Arbitrage Dashboard

A real-time Next.js dashboard for monitoring BSC arbitrage opportunities between PancakeSwap and BiSwap, with live WebSocket updates and PostgreSQL data persistence.

![Dashboard Preview](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue?style=for-the-badge&logo=postgresql)

## ✨ Features

### Real-Time Monitoring

- 🔴 **Live WebSocket Connection** - Updates every 2 seconds
- 📊 **Live Price Display** - Current prices from PancakeSwap & BiSwap
- 📈 **Spread Tracking** - Real-time spread percentage with profit indicators
- ⚡ **Instant Notifications** - Visual alerts when profitable opportunities appear

### Comprehensive Statistics

- 📅 **Days Running** - Total uptime and scan count
- 🎯 **Opportunity Tracking** - All profitable arbitrage opportunities logged
- 💰 **Profit Analysis** - Total potential profit, daily averages, best opportunities
- 📊 **Spread Distribution** - Visualize spread patterns over time

### Data Visualization

- 📉 **Hourly Charts** - Interactive charts showing spread trends
- 📊 **Opportunity Table** - Detailed list of recent arbitrage opportunities
- 🎨 **Color-Coded Stats** - Easy-to-read color-coded metrics
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

```bash
- Node.js 18+
- PostgreSQL 12+
- Python 3.8+ (for the bot)
```

### Step 1: Clone & Install

```bash
cd arbitrage-dashboard
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bsc_arbitrage_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### Step 3: Set Up Database

The database should already be set up from the bot. If not:

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE bsc_arbitrage_db;
\q

# Run the bot once to create tables
python bsc_arbitrage_web3.py
```

### Step 4: Run Dashboard

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Visit http://localhost:3000

## 📊 Dashboard Sections

### 1. Header Stats

```
┌─────────────────────────────────────────────────────────┐
│ 📅 Days Running  │ 🎯 Opportunities │ 💰 Total Potential │
│      3          │       12         │      $48.50       │
└─────────────────────────────────────────────────────────┘
```

### 2. Live Price Display

- Current PancakeSwap price
- Current BiSwap price
- Real-time spread percentage
- Profit opportunity indicator
- Live/disconnected status

### 3. Spread Chart

- 24-hour spread history
- Average and maximum spreads
- Profitable threshold line (0.5%)
- Hourly data points

### 4. Opportunities Table

- Time discovered
- Buy/Sell strategy
- Spread percentage
- Expected profit
- ROI percentage

### 5. Additional Metrics

- Average spread
- Price change frequency
- Maximum spread achieved
- Scans per day
- Opportunities per day

## 🔧 Configuration

### WebSocket Connection

The dashboard automatically connects to WebSocket at `/api/ws`.

To customize update frequency, edit `pages/api/ws.ts`:

```typescript
const interval = setInterval(() => {
  sendUpdate(socket);
}, 2000); // Change from 2000ms (2 seconds)
```

### Database Connection

Configure in `.env` or set environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=bsc_arbitrage_db
export DB_USER=your_user
export DB_PASSWORD=your_password
```

### Time Range

Default is 24 hours. To change, modify API calls:

```typescript
// In pages/index.tsx
const response = await fetch("/api/stats?hours=48"); // 48 hours
```

## 📱 Mobile Responsive

The dashboard is fully responsive:

- **Desktop**: 4-column grid layout
- **Tablet**: 2-column grid layout
- **Mobile**: Single column, optimized for touch

## 🎨 Customization

### Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'arb-green': '#10b981',  // Success color
      'arb-red': '#ef4444',    // Error color
      'arb-blue': '#3b82f6',   // Primary color
    },
  },
}
```

### Chart Colors

Edit `components/SpreadChart.tsx`:

```typescript
<Line dataKey="avgSpread" stroke="#YOUR_COLOR" />
```

## 🔍 API Endpoints

### GET /api/stats

Returns dashboard statistics

**Query Parameters:**

- `hours` (optional): Time range in hours (default: 24)

**Response:**

```json
{
  "stats": {
    "totalScans": 5280,
    "priceChanges": 1234,
    "avgSpread": 0.254,
    "totalOpportunities": 12,
    "totalPotentialProfit": 48.50
  },
  "hourlyStats": [...],
  "spreadDistribution": [...]
}
```

### WebSocket /api/ws

Real-time data stream

**Message Format:**

```json
{
  "type": "update",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "data": {
    "stats": {...},
    "recentScans": [...],
    "opportunities": [...]
  }
}
```

## 🐛 Troubleshooting

### WebSocket Not Connecting

1. Check if bot is running
2. Verify database connection
3. Check browser console for errors
4. Try refreshing the page

```bash
# Check if port 3000 is available
lsof -i :3000

# Restart dashboard
npm run dev
```

### No Data Showing

1. Ensure bot has run and logged data
2. Check database contains records:

```sql
SELECT COUNT(*) FROM price_scans;
SELECT COUNT(*) FROM arbitrage_opportunities;
```

3. Check database credentials in `.env`

### Slow Updates

1. Check database performance:

```sql
EXPLAIN ANALYZE SELECT * FROM price_scans
ORDER BY scan_timestamp DESC LIMIT 10;
```

2. Add indexes if needed (should already exist)

3. Reduce update frequency in `pages/api/ws.ts`

## 📈 Performance

### Optimization Tips

1. **Database Indexing** - Already included in schema
2. **Connection Pooling** - Configured with max 20 connections
3. **Data Limiting** - Only fetches recent data (last 24h)
4. **WebSocket Batching** - Updates sent in batches every 2s

### Expected Performance

- **Update Latency**: <100ms
- **WebSocket Overhead**: ~1KB per update
- **Database Queries**: <50ms (with indexes)
- **Page Load**: <2s (first load)

## 🚀 Production Deployment

### Using Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DB_HOST
vercel env add DB_PASSWORD
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t arbitrage-dashboard .
docker run -p 3000:3000 --env-file .env arbitrage-dashboard
```

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=bsc_arbitrage_db
DB_USER=production_user
DB_PASSWORD=strong_password
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Real-time**: WebSocket (ws)
- **Database**: PostgreSQL, node-postgres (pg)
- **Date Handling**: date-fns

## 🔐 Security

### Best Practices

1. **Environment Variables** - Never commit `.env` files
2. **Database Credentials** - Use strong passwords
3. **API Rate Limiting** - Consider implementing rate limits
4. **SQL Injection** - Uses parameterized queries (safe)
5. **XSS Protection** - React automatically escapes values

### Production Checklist

- [ ] Change default database password
- [ ] Use HTTPS/WSS in production
- [ ] Enable CORS restrictions
- [ ] Add authentication if needed
- [ ] Set up monitoring/logging
- [ ] Configure backups
- [ ] Use environment-specific configs

## 📝 License

MIT License - feel free to use for your arbitrage monitoring!

## 🤝 Contributing

Improvements welcome! Areas to enhance:

- [ ] Add user authentication
- [ ] Multiple DEX support
- [ ] Email/SMS alerts
- [ ] Export data to CSV/Excel
- [ ] Historical data comparison
- [ ] Advanced analytics
- [ ] Mobile app version

## 📞 Support

Having issues? Check:

1. Database connection is working
2. Bot is running and logging data
3. Environment variables are set correctly
4. Node.js version is 18+
5. All dependencies are installed

## 🎯 What's Next?

After getting the dashboard running:

1. ✅ Let bot run for 24 hours
2. ✅ Watch the dashboard live
3. ✅ Analyze patterns in the data
4. ✅ Identify best trading times
5. ✅ Calculate real profitability
6. ✅ Make data-driven decisions!

---

**Built with ❤️ for BSC arbitrage traders**

🚀 Happy Trading! 🚀
