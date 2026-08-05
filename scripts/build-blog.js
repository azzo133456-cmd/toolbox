const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'blog');
const SITE_URL = 'https://toolboxspot.com';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Missing frontmatter block');
  const [, fmBlock, body] = match;
  const data = {};
  for (const line of fmBlock.split('\n')) {
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    data[key] = value;
  }
  return { data, body };
}

function pageTemplate({ title, description, breadcrumbLabel, canonicalPath, jsonld, mainHtml }) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | 小工具箱</title>
<meta name="description" content="${description}">
<link rel="stylesheet" href="../css/style.css">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>

<header class="site-header">
  <div class="inner">
    <a class="brand" href="../index.html"><span class="logo-mark">🧰</span> 小工具箱</a>
    <nav class="main-nav">
      <a href="../index.html#converters">格式轉換</a>
      <a href="../index.html#text">文字工具</a>
      <a href="../index.html#numbers">數值/時間</a>
      <a href="../blog/index.html">文章</a>
    </nav>
  </div>
</header>

<main>
  <div class="breadcrumb"><a href="../index.html">首頁</a> / <a href="../blog/index.html">文章</a>${breadcrumbLabel}</div>
  ${mainHtml}
</main>

<footer>
  <p>© <span id="year"></span> 小工具箱・所有工具皆在瀏覽器端執行,不上傳任何資料</p>
</footer>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}

function buildPost(file) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const { title, description, date, slug } = data;
  if (!title || !description || !date || !slug) {
    throw new Error(`${file}: frontmatter needs title, description, date, slug`);
  }
  const html = marked.parse(body);
  const url = `${SITE_URL}/blog/${slug}.html`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: title,
        description,
        datePublished: date,
        url,
        inLanguage: 'zh-Hant',
        author: { '@type': 'Organization', name: '小工具箱' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: '文章', item: `${SITE_URL}/blog/index.html` },
          { '@type': 'ListItem', position: 3, name: title, item: url },
        ],
      },
    ],
  };

  const mainHtml = `<h1 class="page-title">${title}</h1>
  <p class="article-meta">發布日期:${date}</p>
  <div class="article-body">
${html}  </div>`;

  const pageHtml = pageTemplate({
    title,
    description,
    breadcrumbLabel: ` / ${title}`,
    jsonld,
    mainHtml,
  });

  fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), pageHtml, 'utf8');
  return { title, description, date, slug, url };
}

function buildIndex(posts) {
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: '文章',
        url: `${SITE_URL}/blog/index.html`,
        inLanguage: 'zh-Hant',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: '文章', item: `${SITE_URL}/blog/index.html` },
        ],
      },
    ],
  };

  const listItems = posts
    .map(
      (p) => `    <li>
      <h3><a href="${p.slug}.html">${p.title}</a></h3>
      <p class="article-meta">${p.date}</p>
      <p>${p.description}</p>
    </li>`
    )
    .join('\n');

  const mainHtml = `<h1 class="page-title">文章</h1>
  <p class="page-desc">工具使用教學與實用技巧,幫你更快解決問題。</p>
  <ul class="blog-list">
${listItems}
  </ul>`;

  const pageHtml = pageTemplate({
    title: '文章',
    description: '小工具箱的教學文章,涵蓋格式轉換、圖片處理、PDF 工具等實用技巧。',
    breadcrumbLabel: '',
    jsonld,
    mainHtml,
  });

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), pageHtml, 'utf8');
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map(buildPost);
  buildIndex(posts);
  console.log(`Built ${posts.length} blog post(s) + index.`);
  return posts;
}

if (require.main === module) {
  main();
}

module.exports = { main, SITE_URL };
