import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { getDashboardStats, getRecentScans, getRecentOpportunities } from './lib/database';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Store client limits
const clientLimits = new Map<WebSocket, number>();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (socket: WebSocket) => {
    console.log('✓ Client connected');
    
    // Set default limit for this client
    clientLimits.set(socket, 100);

    // Send initial data
    sendUpdate(socket, 100);

    // Set up interval for periodic updates using client's stored limit
    const interval = setInterval(() => {
      const limit = clientLimits.get(socket) || 100;
      sendUpdate(socket, limit);
    }, 10000);

    socket.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        if (data.type === 'request_update') {
          const limit = data.limit ? parseInt(data.limit) : 100;
          // Store the client's preferred limit
          clientLimits.set(socket, limit);
          console.log(`Client requested limit: ${limit}`);
          await sendUpdate(socket, limit);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    socket.on('close', () => {
      console.log('✗ Client disconnected');
      clearInterval(interval);
      clientLimits.delete(socket);
    });

    socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      clearInterval(interval);
      clientLimits.delete(socket);
    });
  });

  async function sendUpdate(socket: WebSocket, limit: number = 100) {
    try {
      console.log(`Fetching data with limit: ${limit}`);
      
      const [stats, recentScans, opportunities] = await Promise.all([
        getDashboardStats(24),
        getRecentScans(limit),
        getRecentOpportunities(limit),
      ]);

      console.log(`Fetched ${recentScans.length} scans, ${opportunities.length} opportunities`);

      const message = {
        type: 'update',
        timestamp: new Date().toISOString(),
        limit: limit,
        data: {
          stats,
          recentScans,
          opportunities,
        },
      };

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error sending update:', error);
    }
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> WebSocket server on ws://localhost:${PORT}/api/ws`);
  });
});