// Local development server with WebSocket support
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Configuration
const PORT = process.env.PORT || 3000;

// In-memory data store
let responses = {
    yes: 0,
    no: 0,
    records: []
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API: Get all responses
    if (req.url === '/api/responses' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responses));
        return;
    }

    // API: Submit response
    if (req.url === '/api/responses' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                responses[data.response]++;
                responses.records.push({
                    response: data.response,
                    timestamp: data.timestamp,
                    name: data.name || 'Anonymous'
                });

                // Broadcast update to all WebSocket clients
                broadcastUpdate();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // API: Reset data
    if (req.url === '/api/reset' && req.method === 'POST') {
        responses = {
            yes: 0,
            no: 0,
            records: []
        };
        broadcastUpdate();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/truth.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.mp3':
            contentType = 'audio/mpeg';
            break;
        case '.jpeg':
        case '.jpg':
            contentType = 'image/jpeg';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocket server
const wss = new WebSocket.Server({ server });

function broadcastUpdate() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'update',
                data: responses
            }));
        }
    });
}

wss.on('connection', (ws) => {
    // Send current data to new client
    ws.send(JSON.stringify({
        type: 'update',
        data: responses
    }));
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
});
