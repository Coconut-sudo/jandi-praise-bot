// Updated index.js content with logging and response confirmation
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const INCOMING_WEBHOOK_URL = process.env.JANDI_INCOMING_WEBHOOK_URL;
const STORAGE_FILE = 'praises.json';

app.use(bodyParser.json());

// Utility to read and write stored praises
function loadPraises() {
  if (!fs.existsSync(STORAGE_FILE)) return [];
  const data = fs.readFileSync(STORAGE_FILE);
  return JSON.parse(data);
}

function savePraise(text) {
  const praises = loadPraises();
  praises.push(text);
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(praises));
}

function clearPraises() {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify([]));
}

// Receive JANDI Webhook Messages
app.post('/jandi-webhook', async (req, res) => {
  const data = req.body;

  console.log('📩 收到來自 JANDI 的訊息：', JSON.stringify(data, null, 2));

  if (!data || !data.content || !data.sender || data.sender.id === data.bot?.id) {
    return res.sendStatus(200);
  }

  const praiseText = data.content.trim();
  savePraise(praiseText);

  res.status(200).send('收到讚美了，小天使已收藏 ✨');
});

// Cron job: Every day at 8:00 AM Taiwan time (GMT+8)
// Runs at minute 0, second 0 of hour 8 in Asia/Taipei timezone
cron.schedule('0 0 8 * * *', async () => {
  const praises = loadPraises();
  if (praises.length === 0) return;

  const combined = praises.map(p => `• ${p}`).join('\n');
  const finalMessage = `🪽 匿名小天使的每日讚美時間到囉！\n\n${combined}`;

  try {
    await axios.post(INCOMING_WEBHOOK_URL, { body: finalMessage });
    clearPraises();
    console.log('Daily praise posted.');
  } catch (err) {
    console.error('Failed to send daily praise:', err);
  }
}, {
  timezone: 'Asia/Taipei'
});

app.get('/', (req, res) => {
  res.send('JANDI Praise Bot is running.');
});

app.get('/test-publish', async (req, res) => {
  const praises = loadPraises();
  if (praises.length === 0) {
    return res.send('No praises to send.');
  }

  const combined = praises.map(p => `• ${p}`).join('\n');
  const finalMessage = `🪽 匿名小天使的每日讚美時間到囉！\n\n${combined}`;

  try {
    await axios.post(INCOMING_WEBHOOK_URL, { body: finalMessage });
    clearPraises();
    res.send('Praises sent successfully!');
  } catch (err) {
    console.error('Manual send failed:', err);
    res.status(500).send('Failed to send praises.');
  }
  });

  app.listen(PORT, () => {
    console.log(`讚美小天使 listening on port ${PORT}`);
  });
