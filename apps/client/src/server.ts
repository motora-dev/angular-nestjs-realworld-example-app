import 'dotenv/config';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import acceptLanguage from 'accept-language';
import compression from 'compression';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
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

const baseUrl = environment.baseUrl;
const apiUrl = environment.apiUrl;
const gaId = environment.gaId;

function injectGaScripts(html: string): string {
  if (!gaId) {
    return html.replace('<!-- __GA_SCRIPTS__ -->', '');
  }

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

  return html.replace('<!-- __GA_SCRIPTS__ -->', gaScripts);
}

// Inject GA into built index.html files (locale folders and legacy layout)
for (const locale of supportedLocales) {
  const indexHtmlPath = join(browserDistFolder, locale, 'index.csr.html');
  if (existsSync(indexHtmlPath)) {
    const html = readFileSync(indexHtmlPath, 'utf-8');
    writeFileSync(indexHtmlPath, injectGaScripts(html));
  }
}
const legacyIndexHtmlPath = join(browserDistFolder, 'index.csr.html');
if (existsSync(legacyIndexHtmlPath)) {
  const html = readFileSync(legacyIndexHtmlPath, 'utf-8');
  writeFileSync(legacyIndexHtmlPath, injectGaScripts(html));
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
 * Redirect paths without locale prefix to locale-prefixed paths
 * e.g., /register -> /en/register or /ja/register based on Accept-Language header
 */
app.use((req, res, next) => {
  // Skip redirect when running via ng serve (Angular CLI dev server)
  const isNgServe = !isMainModule(import.meta.url) && !environment.production;

  if (isNgServe) {
    next();
    return;
  }

  const path = req.path;

  // Skip if path already has locale prefix
  const firstSegment = path.split('/')[1];
  if (supportedLocales.includes(firstSegment)) {
    next();
    return;
  }

  // Skip static files and API endpoints
  const staticPaths = ['/favicon.ico', '/robots.txt', '/sitemap.xml', '/api'];
  if (staticPaths.some((staticPath) => path.startsWith(staticPath))) {
    next();
    return;
  }

  // Skip if path is root (already handled above)
  if (path === '/') {
    next();
    return;
  }

  // Redirect to locale-prefixed path
  const locale = getLocale(req);
  res.redirect(302, `/${locale}${path}`);
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
 * Handle all other requests with Angular SSR
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

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
