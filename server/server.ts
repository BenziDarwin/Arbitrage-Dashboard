// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import { getDashboardStats, getRecentScans, getRecentOpportunities } from './lib/database';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Create WebSocket server - use WebSocketServer instead of WebSocket.Server
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (socket) => {
    console.log('✓ Client connected');

    // Send initial data
    sendUpdate(socket);

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      sendUpdate(socket);
    }, 10000);

  socket.on('message', async (message) => {
  try {
    const data = JSON.parse(message.toString());

    if (data.type === 'request_update') {
      // Use client-sent limit if available
      const limit = data.limit ? parseInt(data.limit) : 100;
      await sendUpdate(socket, limit);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});


    socket.on('close', () => {
      console.log('✗ Client disconnected');
      clearInterval(interval);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(interval);
    });
  });

  
  async function sendUpdate(socket: WebSocket, limit: number = 100) {
  try {
    const [stats, recentScans, opportunities] = await Promise.all([
      getDashboardStats(24),
      getRecentScans(limit),
      getRecentOpportunities(limit),
    ]);

    const message = {
      type: 'update',
      timestamp: new Date().toISOString(),
      data: {
        stats,
        recentScans,
        opportunities,
      },
    };

    if (socket.readyState === 1) {
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