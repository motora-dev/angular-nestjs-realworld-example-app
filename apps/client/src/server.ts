import 'dotenv/config';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { ISRHandler } from '@rx-angular/isr/server';
import acceptLanguage from 'accept-language';
import compression from 'compression';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { environment } from '$environments';

// Supported locales - detected from dist output
const distFolder = join(import.meta.dirname, '..');
const browserDistFolder = join(distFolder, 'browser');
const supportedLocales = existsSync(browserDistFolder)
  ? readdirSync(browserDistFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((name) => name === 'en' || name === 'ja')
  : ['en'];
const defaultLocale = 'en';

// Setup accept-language parser
acceptLanguage.languages(supportedLocales);

// Get locale from request (Accept-Language header or URL path)
function getLocale(req: express.Request): string {
  // First, check URL path for locale (e.g., /ja/, /en/)
  const urlLocale = req.path.split('/')[1];
  if (supportedLocales.includes(urlLocale)) {
    return urlLocale;
  }

  // Otherwise, use Accept-Language header
  const acceptLang = req.headers['accept-language'];
  if (acceptLang) {
    const detected = acceptLanguage.get(acceptLang);
    if (detected && supportedLocales.includes(detected)) {
      return detected;
    }
  }

  return defaultLocale;
}

// Load index.html for each locale (for ISR)
const indexHtmlByLocale: Record<string, string> = {};
for (const locale of supportedLocales) {
  const indexHtmlPath = join(browserDistFolder, locale, 'index.csr.html');
  if (existsSync(indexHtmlPath)) {
    indexHtmlByLocale[locale] = readFileSync(indexHtmlPath, 'utf-8');
  }
}

// Fallback to non-localized structure if no locale folders exist
const legacyIndexHtmlPath = join(browserDistFolder, 'index.csr.html');
if (Object.keys(indexHtmlByLocale).length === 0 && existsSync(legacyIndexHtmlPath)) {
  indexHtmlByLocale[defaultLocale] = readFileSync(legacyIndexHtmlPath, 'utf-8');
}

const baseUrl = environment.baseUrl;
const apiUrl = environment.apiUrl;
const gaId = environment.gaId;

// Inject Google Analytics scripts if GA ID is configured
if (gaId) {
  const gaScripts = `
    <!-- Consent Mode v2 default settings -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}

      // Default to denied
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });

      // Check localStorage for consent status
      try {
        var consent = localStorage.getItem('cookie-consent');
        if (consent === 'accepted') {
          gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted'
          });
        }
      } catch (e) {
        // LocalStorage access error - do nothing
      }
    </script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>`;

  // Inject GA scripts into all locale index.html files
  for (const locale of Object.keys(indexHtmlByLocale)) {
    indexHtmlByLocale[locale] = indexHtmlByLocale[locale].replace('<!-- __GA_SCRIPTS__ -->', gaScripts);
  }
} else {
  // Remove placeholder from all locale index.html files
  for (const locale of Object.keys(indexHtmlByLocale)) {
    indexHtmlByLocale[locale] = indexHtmlByLocale[locale].replace('<!-- __GA_SCRIPTS__ -->', '');
  }
}

const app = express();
const angularApp = new AngularNodeAppEngine();

// Enable gzip/brotli compression for all responses
app.use(compression() as any);

// Non-production environments: add noindex header
if (!environment.production) {
  app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
}

// Basic authentication (enabled via environment variable for preview/develop environments)
if (process.env['BASIC_AUTH_ENABLED'] === 'true') {
  const user = process.env['BASIC_AUTH_USER'];
  const password = process.env['BASIC_AUTH_PASSWORD'];
  if (user && password) {
    app.use(
      basicAuth({
        users: { [user]: password },
        challenge: true,
        realm: 'motora-dev',
      }),
    );
  }
}

// ISRHandler for caching per locale (only initialize if index.html exists)
const isrByLocale: Record<string, ISRHandler> = {};
for (const locale of Object.keys(indexHtmlByLocale)) {
  isrByLocale[locale] = new ISRHandler({
    indexHtml: indexHtmlByLocale[locale],
    invalidateSecretToken: process.env['ISR_SECRET'] || 'MY_SECRET_TOKEN',
    enableLogging: process.env['NODE_ENV'] !== 'production',
    angularAppEngine: angularApp, // Use AngularNodeAppEngine for rendering
  });
}

// Default ISR for backwards compatibility
const isr = isrByLocale[defaultLocale] || null;

// Parse JSON for invalidation endpoint
app.use(express.json());

/**
 * Serve favicon.ico from the default locale folder
 */
app.get('/favicon.ico', (req, res) => {
  const faviconPath = join(browserDistFolder, defaultLocale, 'favicon.ico');
  if (existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    res.status(404).send('Not Found');
  }
});

/**
 * Redirect root path to detected locale
 * e.g., / -> /en or /ja based on Accept-Language header
 */
app.get('/', (req, res, next) => {
  // Skip redirect when running via ng serve (Angular CLI dev server)
  const isNgServe = !isMainModule(import.meta.url) && !environment.production;

  if (isNgServe) {
    // In ng serve, treat root path as /en and continue to next middleware
    req.url = '/en' + (req.url === '/' ? '' : req.url);
    next();
    return;
  }

  const locale = getLocale(req);
  res.redirect(302, `/${locale}`);
});

/**
 * robots.txt endpoint
 */
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /private/
Sitemap: ${baseUrl}/sitemap.xml`);
});

/**
 * sitemap.xml endpoint
 * Fetches article data from NestJS API and generates XML sitemap
 */
app.get('/sitemap.xml', async (req, res) => {
  const staticPages = [
    { url: baseUrl, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/privacy-policy`, lastmod: new Date().toISOString() },
  ];

  let articleUrls: Array<{ url: string; lastmod: string }> = [];

  // Fetch sitemap data from NestJS API
  const response = await fetch(`${apiUrl}/sitemap`);
  if (response.ok) {
    const data = await response.json();
    articleUrls = data.articles.map((article: { slug: string; updatedAt: string }) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastmod: article.updatedAt,
    }));
  }

  const allUrls = [...staticPages, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

/**
 * ISR cache invalidation endpoint (internal use only)
 * POST /api/invalidate with { "token": "MY_SECRET_TOKEN", "urlsToInvalidate": ["/home"] }
 */
app.post('/api/invalidate', async (req, res) => {
  if (isr) {
    await isr.invalidate(req, res);
  } else {
    res.status(503).json({ error: 'ISR not available' });
  }
});

/**
 * ISR cache invalidation proxy endpoint (requires session auth)
 * POST /api/invalidate-cache with { "urlsToInvalidate": ["/article/xxx/yyy"] }
 *
 * This endpoint verifies the user's session with NestJS API before invalidating cache.
 * The ISR_SECRET token is added server-side, so clients don't need to know it.
 */
app.post('/api/invalidate-cache', async (req, res) => {
  if (!isr) {
    res.status(503).json({ error: 'ISR not available' });
    return;
  }

  // Forward cookies to NestJS API to verify session
  const cookie = req.headers.cookie;
  const checkSessionResponse = await fetch(`${apiUrl}/auth/check-session`, {
    headers: cookie ? { cookie } : {},
    credentials: 'include',
  });

  if (!checkSessionResponse.ok) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const sessionData = await checkSessionResponse.json();
  if (!sessionData.authenticated) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Add ISR secret token to the request body and call invalidate
  const urlsToInvalidate = req.body.urlsToInvalidate;
  if (!Array.isArray(urlsToInvalidate) || urlsToInvalidate.length === 0) {
    res.status(400).json({ error: 'urlsToInvalidate must be a non-empty array' });
    return;
  }

  // Create a modified request with the token
  req.body.token = process.env['ISR_SECRET'] || 'MY_SECRET_TOKEN';

  await isr.invalidate(req, res);
});

/**
 * Serve static files from /browser/{locale}
 * Static files are served without locale detection since they have hashed names
 */
for (const locale of supportedLocales) {
  const localeDistFolder = join(browserDistFolder, locale);
  if (existsSync(localeDistFolder)) {
    app.use(
      `/${locale}`,
      express.static(localeDistFolder, {
        maxAge: '1y',
        index: false,
        redirect: false,
      }),
    );
  }
}

// Also serve from root for backwards compatibility (if no locale folders)
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests:
 * - Detect locale from Accept-Language header or URL path
 * - If ISR is available: try cache first, then render with ISR
 * - If ISR is not available: fallback to AngularNodeAppEngine
 */
app.use(
  async (req, res, next) => {
    const locale = getLocale(req);
    const localeIsr = isrByLocale[locale] || isr;

    if (localeIsr) {
      // First, try to serve from cache
      await localeIsr.serveFromCache(req, res, next);
    } else {
      next();
    }
  },
  async (req, res, next) => {
    const locale = getLocale(req);
    const localeIsr = isrByLocale[locale] || isr;

    if (localeIsr) {
      // If not in cache, render and cache
      await localeIsr.render(req, res, next);
    } else {
      // Fallback: Standard Angular SSR without ISR
      angularApp
        .handle(req)
        .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
        .catch(next);
    }
  },
);

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4200;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler: ReturnType<typeof createNodeRequestHandler> = createNodeRequestHandler(app);
