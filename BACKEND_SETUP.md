# Node.js Backend Setup Guide

## Overview
This guide shows you how to set up a Node.js backend that works with your Lovable frontend.

## Required API Endpoints

Your Node.js backend needs to implement these three endpoints:

### 1. Twitter Search
```
GET /api/search/twitter?keyword=your+search+term
```

**Response Format:**
```json
{
  "results": [
    {
      "title": "Tweet author handle",
      "snippet": "Tweet content",
      "link": "https://twitter.com/...",
      "source": "Twitter",
      "date": "2025-10-04T12:00:00.000Z",
      "author": "Author Name"
    }
  ]
}
```

### 2. Facebook Search
```
GET /api/search/facebook?keyword=your+search+term
```

**Response Format:** Same as Twitter

### 3. Google News Search
```
GET /api/search/google-news?keyword=your+search+term
```

**Response Format:** Same as Twitter

## Example Node.js Implementation

### Setup
```bash
npm init -y
npm install express cors dotenv axios
```

### server.js Example
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Lovable frontend
app.use(cors({
  origin: '*', // In production, replace with your Lovable domain
}));

app.use(express.json());

// Twitter Search Endpoint
app.get('/api/search/twitter', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // TODO: Implement Twitter API call
    const results = [
      {
        title: "@example",
        snippet: "Sample tweet about " + keyword,
        link: "https://twitter.com/example/status/123",
        source: "Twitter",
        date: new Date().toISOString(),
        author: "Example User"
      }
    ];
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Facebook Search Endpoint
app.get('/api/search/facebook', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // TODO: Implement Facebook API call
    const results = [];
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google News Search Endpoint
app.get('/api/search/google-news', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // TODO: Implement Google Custom Search API call
    const results = [];
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Environment Variables (.env)
```env
PORT=3000
TWITTER_BEARER_TOKEN=your_token_here
FACEBOOK_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
GOOGLE_SEARCH_ENGINE_ID=your_id_here
```

## CORS Configuration

Make sure your Node.js backend allows requests from your Lovable frontend:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'https://your-project.lovableproject.com', // Your Lovable domain
  ],
  credentials: true,
}));
```

## Deployment Options

### Option 1: Railway
```bash
npm install -g railway
railway login
railway init
railway up
```

### Option 2: Render
1. Push code to GitHub
2. Connect GitHub to Render
3. Deploy as Web Service

### Option 3: Vercel (Serverless)
```bash
npm install -g vercel
vercel
```

### Option 4: Heroku
```bash
heroku create your-app-name
git push heroku main
```

## Update Frontend Configuration

After deploying your Node.js backend, update the API URL in `src/pages/Index.tsx`:

```typescript
const API_BASE_URL = "https://your-nodejs-backend.com/api";
```

## Testing

Test your endpoints using curl:
```bash
curl "http://localhost:3000/api/search/twitter?keyword=test"
```

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use environment variables for secrets**
3. **Implement rate limiting** (use `express-rate-limit`)
4. **Add authentication** if needed
5. **Validate input parameters**
6. **Use HTTPS in production**

## Need Help?

- Make sure CORS is properly configured
- Check that all environment variables are set
- Verify your API keys are valid
- Test endpoints individually before integrating
