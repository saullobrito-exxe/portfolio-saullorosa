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
    let parsed = req.body;

    const saveBase64 = (dataUri: string, targetRelPath: string) => {
      if (!dataUri || !dataUri.startsWith('data:image/')) return dataUri;
      const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) return dataUri;
      const buffer = Buffer.from(matches[2], 'base64');
      const publicPath = path.resolve('public', targetRelPath);
      const srcPath = path.resolve('src', targetRelPath);
      fs.mkdirSync(path.dirname(publicPath), { recursive: true });
      fs.mkdirSync(path.dirname(srcPath), { recursive: true });
      fs.writeFileSync(publicPath, buffer);
      fs.writeFileSync(srcPath, buffer);
      return '/' + targetRelPath.replace(/\\/g, '/');
    };

    if (parsed?.personalInfo?.photoUrl?.startsWith('data:')) {
      parsed.personalInfo.photoUrl = saveBase64(parsed.personalInfo.photoUrl, 'assets/images/saullo_profile.webp');
    }
    if (parsed?.personalInfo?.headerBannerUrl?.startsWith('data:')) {
      parsed.personalInfo.headerBannerUrl = saveBase64(parsed.personalInfo.headerBannerUrl, 'assets/images/saullo_header_banner.webp');
    }
    if (Array.isArray(parsed?.projects)) {
      parsed.projects.forEach((proj: any, idx: number) => {
        if (proj.coverImage?.startsWith('data:')) {
          const extMatch = proj.coverImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
          const ext = extMatch && extMatch[1] === 'jpeg' ? 'jpg' : (extMatch ? extMatch[1] : 'webp');
          proj.coverImage = saveBase64(proj.coverImage, `assets/images/project_${proj.id || idx}_cover.${ext}`);
        }
        if (Array.isArray(proj.featuredMedia)) {
          proj.featuredMedia.forEach((m: any, mi: number) => {
            if (m.url?.startsWith('data:')) {
              const extMatch = m.url.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
              const ext = extMatch && extMatch[1] === 'jpeg' ? 'jpg' : (extMatch ? extMatch[1] : 'webp');
              m.url = saveBase64(m.url, `assets/images/project_${proj.id || idx}_media_${mi}.${ext}`);
            }
          });
        }
      });
    }

    await fs.promises.writeFile(savedPortfolioPath, JSON.stringify(parsed, null, 2), 'utf-8');
    const publicFilePath = path.resolve('public', 'savedPortfolio.json');
    await fs.promises.writeFile(publicFilePath, JSON.stringify(parsed, null, 2), 'utf-8');

    // Auto-sync with GitHub repositories in background
    try {
      const { exec } = await import('child_process');
      exec('git add . && git commit -m "update: portfolio content and photos" && git push origin main --force', (err, stdout, stderr) => {
        if (err) {
          console.log('[Git Auto-Sync] Notice:', stderr || err.message);
        } else {
          console.log('[Git Auto-Sync] Successfully pushed updates to GitHub');
        }
      });
    } catch (gitErr) {
      console.error('[Git Auto-Sync] Error:', gitErr);
    }

    return res.json({ success: true, data: parsed });
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
