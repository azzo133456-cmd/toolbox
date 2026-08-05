const express = require('express');

const app = express();
const SITE_URL = 'https://toolbox-web-production-f9b6.up.railway.app';
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.set('Link', `<${SITE_URL}${req.path}>; rel="canonical"`);
  }
  next();
});
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`toolbox-web listening on ${PORT}`));
