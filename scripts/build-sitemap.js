const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://toolboxspot.com';

function main() {
  const urls = [`${SITE_URL}/`, `${SITE_URL}/about.html`];

  const toolFiles = fs.readdirSync(path.join(ROOT, 'tools')).filter((f) => f.endsWith('.html'));
  for (const f of toolFiles.sort()) {
    urls.push(`${SITE_URL}/tools/${f}`);
  }

  const blogDir = path.join(ROOT, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html'));
    for (const f of blogFiles.sort()) {
      urls.push(`${SITE_URL}/blog/${f}`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml written with ${urls.length} URLs.`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
