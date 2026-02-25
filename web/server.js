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
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(to right, #1e3c72, #2a5298);
            color: #fff;
            text-align: center;
            padding: 50px;
          }
          .card {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
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
      </body>
      </html>
    `);
  });
});

app.listen(5000, function () {
  console.log('🌐 Web application is listening on port 5000');
});
