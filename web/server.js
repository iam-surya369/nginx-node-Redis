const os = require('os');
const express = require('express');
const app = express();
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

app.get('/', function (req, res) {
  redisClient.get('numVisits', function (err, numVisits) {
    let numVisitsToDisplay = parseInt(numVisits) + 1;
    if (isNaN(numVisitsToDisplay)) {
      numVisitsToDisplay = 1;
    }

    // Update Redis
    redisClient.set('numVisits', numVisitsToDisplay);

    // Determine server color based on hostname
    const hostname = os.hostname();
    const isWeb1 = hostname.toLowerCase().includes('web1');
    const badgeColor = isWeb1 ? '#2ecc71' : '#3498db';
    const badgeEmoji = isWeb1 ? '🟢' : '🔵';
    const badgeLabel = isWeb1 ? 'web1' : 'web2';

    // Send attractive HTML response
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Visit Counter</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
            color: #fff;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }
          .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px 50px;
            border-radius: 16px;
            display: inline-block;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
          }
          p {
            font-size: 1.3rem;
            margin: 10px 0;
          }
          .highlight {
            font-weight: bold;
            font-size: 1.5rem;
            color: #ffd700;
          }
          .server-badge {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 24px;
            border-radius: 50px;
            background: ${badgeColor};
            color: #fff;
            font-size: 1.1rem;
            font-weight: bold;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 10px ${badgeColor}80;
            animation: fadeIn 0.5s ease-in;
          }
          .arch-section {
            margin-top: 40px;
            padding: 25px 40px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.08);
            animation: fadeIn 0.8s ease-in;
          }
          .arch-section h2 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: rgba(255,255,255,0.7);
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .arch-flow {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .arch-item {
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-size: 1rem;
            border: 1px solid rgba(255,255,255,0.15);
          }
          .arch-arrow {
            font-size: 1.2rem;
            color: rgba(255,255,255,0.4);
          }
          .footer {
            margin-top: 30px;
            font-size: 0.85rem;
            color: rgba(255,255,255,0.35);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🌍 Welcome to Request Counter</h1>
          <p>Total Visits: <span class="highlight">${numVisitsToDisplay}</span></p>
          <div class="server-badge">${badgeEmoji} Served by: ${badgeLabel} (${hostname})</div>
        </div>

        <div class="arch-section">
          <h2>⚙️ Architecture</h2>
          <div class="arch-flow">
            <div class="arch-item">🌐 Client</div>
            <div class="arch-arrow">→</div>
            <div class="arch-item">⚡ Nginx</div>
            <div class="arch-arrow">→</div>
            <div class="arch-item" style="border-color: ${badgeColor}; box-shadow: 0 0 8px ${badgeColor}40;">🟢 Node.js (×2)</div>
            <div class="arch-arrow">→</div>
            <div class="arch-item">🔴 Redis</div>
          </div>
        </div>

        <div class="footer">Nginx Load Balancer &bull; Node.js Backend &bull; Redis Data Store</div>
      </body>
      </html>
    `);
  });
});

app.listen(5000, function () {
  console.log('🌐 Web application is listening on port 5000');
});
