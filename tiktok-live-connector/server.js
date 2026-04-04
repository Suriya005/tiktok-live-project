const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active connections
const activeConnections = new Map();
const wsClients = new Map();

// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`🚀 TikTok Live Gift API running on port ${PORT}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const clientId = Date.now() + Math.random();
    wsClients.set(clientId, ws);
    
    console.log(`✅ New WebSocket client connected: ${clientId}`);
    
    ws.on('close', () => {
        wsClients.delete(clientId);
        console.log(`❌ WebSocket client disconnected: ${clientId}`);
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

// Broadcast to all WebSocket clients
function broadcast(event, data) {
    const message = JSON.stringify({ event, data, timestamp: new Date() });
    wsClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Connect to TikTok Live
async function connectToLive(username, sessionId = null) {
    if (activeConnections.has(username)) {
        throw new Error(`Already connected to @${username}`);
    }

    const tiktokLiveConnection = new WebcastPushConnection(username);
    
    // Store connection
    activeConnections.set(username, {
        connection: tiktokLiveConnection,
        username,
        connectedAt: new Date(),
        stats: {
            totalGifts: 0,
            totalCoins: 0,
            totalComments: 0,
            totalLikes: 0,
            totalViewers: 0
        }
    });

    // Gift event
    tiktokLiveConnection.on('gift', (data) => {
        const connection = activeConnections.get(username);
        if (!connection) return; // Connection already closed

        const giftInfo = {
            username: data.uniqueId,
            nickname: data.nickname,
            giftName: data.giftName,
            giftId: data.giftId,
            giftPictureUrl: data.giftPictureUrl,
            repeatCount: data.repeatCount,
            repeatEnd: data.repeatEnd,
            diamondCount: data.diamondCount,
            timestamp: new Date()
        };

        connection.stats.totalGifts++;
        connection.stats.totalCoins += data.diamondCount * data.repeatCount;

        console.log(`🎁 Gift from @${data.uniqueId}: ${data.giftName} x${data.repeatCount}`);
        broadcast('gift', { ...giftInfo, streamUsername: username });
    });

    // Comment event
    tiktokLiveConnection.on('chat', (data) => {
        const connection = activeConnections.get(username);
        if (!connection) return; // Connection already closed

        const commentInfo = {
            username: data.uniqueId,
            nickname: data.nickname,
            comment: data.comment,
            timestamp: new Date()
        };

        connection.stats.totalComments++;

        broadcast('comment', { ...commentInfo, streamUsername: username });
    });

    // Like event
    tiktokLiveConnection.on('like', (data) => {
        const connection = activeConnections.get(username);
        if (!connection) return; // Connection already closed

        const likeInfo = {
            username: data.uniqueId,
            nickname: data.nickname,
            likeCount: data.likeCount,
            totalLikeCount: data.totalLikeCount,
            timestamp: new Date()
        };

        connection.stats.totalLikes += data.likeCount;

        broadcast('like', { ...likeInfo, streamUsername: username });
    });

    // Viewer count event
    tiktokLiveConnection.on('roomUser', (data) => {
        const connection = activeConnections.get(username);
        if (!connection) return; // Connection already closed

        connection.stats.totalViewers = data.viewerCount || 0;

        broadcast('viewers', {
            viewerCount: data.viewerCount,
            streamUsername: username,
            timestamp: new Date()
        });
    });

    // Share event
    tiktokLiveConnection.on('share', (data) => {
        broadcast('share', {
            username: data.uniqueId,
            nickname: data.nickname,
            streamUsername: username,
            timestamp: new Date()
        });
    });

    // Follow event
    tiktokLiveConnection.on('follow', (data) => {
        broadcast('follow', {
            username: data.uniqueId,
            nickname: data.nickname,
            streamUsername: username,
            timestamp: new Date()
        });
    });

    // Connection state events
    tiktokLiveConnection.on('connected', () => {
        console.log(`✅ Connected to @${username}`);
        broadcast('connected', { username, timestamp: new Date() });
    });

    tiktokLiveConnection.on('disconnected', () => {
        console.log(`❌ Disconnected from @${username}`);
        activeConnections.delete(username);
        broadcast('disconnected', { username, timestamp: new Date() });
    });

    tiktokLiveConnection.on('error', (err) => {
        console.error(`Error for @${username}:`, err);
        broadcast('error', { username, error: err.message, timestamp: new Date() });
    });

    // Connect
    await tiktokLiveConnection.connect();
    
    return activeConnections.get(username);
}

// REST API Endpoints

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        activeConnections: activeConnections.size,
        wsClients: wsClients.size,
        timestamp: new Date()
    });
});

// Connect to a live stream
app.post('/api/connect', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const connection = await connectToLive(username);
        
        res.json({
            success: true,
            message: `Connected to @${username}`,
            connection: {
                username: connection.username,
                connectedAt: connection.connectedAt,
                stats: connection.stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Disconnect from a live stream
app.post('/api/disconnect', (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const activeConnection = activeConnections.get(username);
        
        if (!activeConnection) {
            return res.status(404).json({ error: `Not connected to @${username}` });
        }

        activeConnection.connection.disconnect();
        activeConnections.delete(username);
        
        res.json({
            success: true,
            message: `Disconnected from @${username}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all active connections
app.get('/api/connections', (req, res) => {
    const connections = Array.from(activeConnections.values()).map(conn => ({
        username: conn.username,
        connectedAt: conn.connectedAt,
        stats: conn.stats
    }));
    
    res.json({
        success: true,
        count: connections.length,
        connections
    });
});

// Get stats for a specific connection
app.get('/api/stats/:username', (req, res) => {
    const { username } = req.params;
    const connection = activeConnections.get(username);
    
    if (!connection) {
        return res.status(404).json({
            success: false,
            error: `Not connected to @${username}`
        });
    }
    
    res.json({
        success: true,
        username: connection.username,
        connectedAt: connection.connectedAt,
        stats: connection.stats
    });
});

// Disconnect all connections
app.post('/api/disconnect-all', (req, res) => {
    try {
        const disconnected = [];
        
        activeConnections.forEach((conn, username) => {
            conn.connection.disconnect();
            disconnected.push(username);
        });
        
        activeConnections.clear();
        
        res.json({
            success: true,
            message: 'All connections disconnected',
            disconnected
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    
    activeConnections.forEach((conn) => {
        conn.connection.disconnect();
    });
    
    wss.close(() => {
        console.log('WebSocket server closed');
    });
    
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
