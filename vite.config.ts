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
                const parsed = JSON.parse(body);
                await fs.promises.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true }));
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
