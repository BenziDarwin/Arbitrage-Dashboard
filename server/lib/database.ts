// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '84.247.167.128',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bsc_arbitrage_db',
  user: process.env.DB_USER || 'main_user',
  password: process.env.DB_PASSWORD || 'password=1',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface PriceScan {
  id: number;
  scan_timestamp: Date;
  pancakeswap_price: number;
  biswap_price: number;
  spread_percentage: number;
  price_changed: boolean;
  created_at: Date;
}

export interface ArbitrageOpportunity {
  id: number;
  scan_id: number;
  opportunity_timestamp: Date;
  buy_dex: string;
  sell_dex: string;
  buy_price: number;
  sell_price: number;
  spread_percentage: number;
  tokens_bought: number;
  usd_return: number;
  gross_profit: number;
  net_profit: number;
  roi_percentage: number;
  flash_loan_amount: number;
  executed: boolean;
  created_at: Date;
}

export interface BotSession {
  id: number;
  session_start: Date;
  session_end: Date | null;
  total_scans: number;
  opportunities_found: number;
  status: string;
  created_at: Date;
}

export interface DashboardStats {
  totalScans: number;
  priceChanges: number;
  avgSpread: number;
  maxSpread: number;
  minSpread: number;
  totalOpportunities: number;
  totalPotentialProfit: number;
  avgProfit: number;
  maxProfit: number;
  daysRunning: number;
  currentSession: BotSession | null;
}

export async function getDashboardStats(hours: number = 24): Promise<DashboardStats> {
  const client = await pool.connect();
  
  try {
    // Get scan stats
    const scanStats = await client.query(`
      SELECT 
        COUNT(*) as total_scans,
        COUNT(CASE WHEN price_changed THEN 1 END) as price_changes,
        AVG(spread_percentage) as avg_spread,
        MAX(spread_percentage) as max_spread,
        MIN(spread_percentage) as min_spread
      FROM price_scans
      WHERE scan_timestamp >= NOW() - INTERVAL '${hours} hours';
    `);
    
    // Get opportunity stats
    const oppStats = await client.query(`
      SELECT 
        COUNT(*) as total_opportunities,
        COALESCE(SUM(net_profit), 0) as total_potential_profit,
        COALESCE(AVG(net_profit), 0) as avg_profit,
        COALESCE(MAX(net_profit), 0) as max_profit
      FROM arbitrage_opportunities
      WHERE opportunity_timestamp >= NOW() - INTERVAL '${hours} hours';
    `);
    
    // Get current session
    const sessionResult = await client.query(`
      SELECT * FROM bot_sessions
      WHERE status = 'running'
      ORDER BY session_start DESC
      LIMIT 1;
    `);
    
    // Calculate days running
    const daysResult = await client.query(`
      SELECT 
        EXTRACT(DAY FROM (NOW() - MIN(scan_timestamp))) as days_running
      FROM price_scans;
    `);
    
    const scan = scanStats.rows[0];
    const opp = oppStats.rows[0];
    const session = sessionResult.rows[0] || null;
    const days = parseFloat(daysResult.rows[0]?.days_running || '0');
    
    return {
      totalScans: parseInt(scan.total_scans) || 0,
      priceChanges: parseInt(scan.price_changes) || 0,
      avgSpread: parseFloat(scan.avg_spread) || 0,
      maxSpread: parseFloat(scan.max_spread) || 0,
      minSpread: parseFloat(scan.min_spread) || 0,
      totalOpportunities: parseInt(opp.total_opportunities) || 0,
      totalPotentialProfit: parseFloat(opp.total_potential_profit) || 0,
      avgProfit: parseFloat(opp.avg_profit) || 0,
      maxProfit: parseFloat(opp.max_profit) || 0,
      daysRunning: Math.floor(days),
      currentSession: session,
    };
  } finally {
    client.release();
  }
}

export async function getRecentScans(limit: number = 100): Promise<PriceScan[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM price_scans
      ORDER BY scan_timestamp DESC
      LIMIT $1;
    `, [limit]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getRecentOpportunities(limit: number = 50): Promise<ArbitrageOpportunity[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM arbitrage_opportunities
      ORDER BY opportunity_timestamp DESC
      LIMIT $1;
    `, [limit]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getHourlyStats(hours: number = 24) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        DATE_TRUNC('hour', scan_timestamp) as hour,
        COUNT(*) as scans,
        AVG(spread_percentage) as avg_spread,
        MAX(spread_percentage) as max_spread,
        COUNT(CASE WHEN price_changed THEN 1 END) as price_changes
      FROM price_scans
      WHERE scan_timestamp >= NOW() - INTERVAL '${hours} hours'
      GROUP BY hour
      ORDER BY hour ASC;
    `);
    
    return result.rows.map(row => ({
      hour: row.hour,
      scans: parseInt(row.scans),
      avgSpread: parseFloat(row.avg_spread),
      maxSpread: parseFloat(row.max_spread),
      priceChanges: parseInt(row.price_changes),
    }));
  } finally {
    client.release();
  }
}

export async function getSpreadDistribution(hours: number = 24) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        CASE 
          WHEN spread_percentage < 0.1 THEN '0.00-0.10%'
          WHEN spread_percentage < 0.2 THEN '0.10-0.20%'
          WHEN spread_percentage < 0.3 THEN '0.20-0.30%'
          WHEN spread_percentage < 0.4 THEN '0.30-0.40%'
          WHEN spread_percentage < 0.5 THEN '0.40-0.50%'
          WHEN spread_percentage < 0.6 THEN '0.50-0.60%'
          WHEN spread_percentage < 0.7 THEN '0.60-0.70%'
          WHEN spread_percentage < 0.8 THEN '0.70-0.80%'
          WHEN spread_percentage < 0.9 THEN '0.80-0.90%'
          ELSE '0.90%+'
        END as spread_range,
        COUNT(*) as count,
        ROUND(COUNT(*)::NUMERIC / (
          SELECT COUNT(*) FROM price_scans 
          WHERE scan_timestamp >= NOW() - INTERVAL '${hours} hours'
        ) * 100, 2) as percentage
      FROM price_scans
      WHERE scan_timestamp >= NOW() - INTERVAL '${hours} hours'
      GROUP BY spread_range
      ORDER BY spread_range;
    `);
    
    return result.rows.map(row => ({
      range: row.spread_range,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage),
    }));
  } finally {
    client.release();
  }
}

export default pool;
