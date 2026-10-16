import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function portfolioApiPlugin(): Plugin {
  return {
    name: 'portfolio-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Health check endpoint for external monitoring, Cloud Run, and domain checkers
        if (req.url === '/health' || req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.end(JSON.stringify({ status: 'ok', domain: 'saullo.rosa', timestamp: new Date().toISOString() }));
        }

        if (req.url === '/api/portfolio') {
          const filePath = path.resolve(import.meta.dirname || '.', 'src/data/savedPortfolio.json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            return res.end();
          }

          if (req.method === 'GET') {
            try {
              if (fs.existsSync(filePath)) {
                const data = await fs.promises.readFile(filePath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(data);
              }
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(null));
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: String(err) }));
            }
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                let parsed = JSON.parse(body);

                // Auto-extract base64 images into public/assets/images and src/assets/images
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

                await fs.promises.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
                const publicFilePath = path.resolve('public', 'savedPortfolio.json');
                await fs.promises.writeFile(publicFilePath, JSON.stringify(parsed, null, 2), 'utf-8');

                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, data: parsed }));
              } catch (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ error: String(err) }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), portfolioApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
