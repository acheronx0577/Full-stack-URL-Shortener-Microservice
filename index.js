const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const path = require('path');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener Implementation
let urlDatabase = [];
let shortUrlCounter = 1;

// Helper function to validate URL
function isValidUrl(string) {
  try {
    const parsedUrl = new URL(string);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// POST endpoint to create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists in database
  const existingUrl = urlDatabase.find(entry => entry.original_url === originalUrl);
  
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url
    });
  }

  // Create new short URL
  const shortUrl = shortUrlCounter++;
  const newUrlEntry = {
    original_url: originalUrl,
    short_url: shortUrl
  };
  
  urlDatabase.push(newUrlEntry);
  
  res.json({
    original_url: originalUrl,
    short_url: shortUrl
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// ADD THIS ENDPOINT - Stats endpoint for frontend
app.get('/api/stats', (req, res) => {
  res.json({
    total: urlDatabase.length,
    active: urlDatabase.length
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});