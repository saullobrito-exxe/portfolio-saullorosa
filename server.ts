import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const customDomain = process.env.CUSTOM_DOMAIN; // e.g. "saullo.rosa"

// Trust reverse proxy (Cloudflare, Nginx, Google Cloud, Vercel)
app.set('trust proxy', true);

// Standard Security & Performance Headers (with open CORS for public domain accessibility)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  // Optional canonical domain redirect if configured in production
  if (customDomain && process.env.NODE_ENV === 'production') {
    const host = req.headers.host;
    if (host && host !== customDomain && host === `www.${customDomain}`) {
      return res.redirect(301, `https://${customDomain}${req.originalUrl}`);
    }
  }

  next();
});

// Health check endpoints for load balancers and domain monitoring
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    domain: customDomain || req.headers.host || 'localhost',
  });
});

// JSON body parser for API requests
app.use(express.json({ limit: '50mb' }));

// Shared persistent portfolio storage
const savedPortfolioPath = path.join(__dirname, 'src/data/savedPortfolio.json');

app.get('/api/portfolio', async (req, res) => {
  try {
    const fs = await import('fs');
    if (fs.existsSync(savedPortfolioPath)) {
      const content = await fs.promises.readFile(savedPortfolioPath, 'utf-8');
      return res.type('application/json').send(content);
    }
    return res.json(null);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/portfolio', async (req, res) => {
  try {
    const fs = await import('fs');
    await fs.promises.writeFile(savedPortfolioPath, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Serve static assets with caching
const distPath = path.join(__dirname, 'dist');
app.use(
  express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    index: false,
    setHeaders: (res, filePath) => {
      // Don't cache index.html, robots.txt, sitemap.xml indefinitely
      if (
        filePath.endsWith('.html') ||
        filePath.endsWith('robots.txt') ||
        filePath.endsWith('sitemap.xml')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server listening on port ${port} (Ready for domain ${customDomain || 'custom domain'})`);
});
