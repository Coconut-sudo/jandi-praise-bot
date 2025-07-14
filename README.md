# jandi-praise-bot

A simple anonymous praise bot for JANDI.

## Features
- Accepts praise via JANDI outgoing webhook
- Stores praises anonymously
- Posts a daily summary to a JANDI group at 8:00 AM Taiwan time

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file and fill in your webhook:
   ```
   JANDI_INCOMING_WEBHOOK_URL=your_webhook_url_here
   ```

3. Run the bot:
   ```
   npm start
   ```
