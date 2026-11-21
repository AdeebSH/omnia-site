import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const SOURCE = path.join(ROOT, "content", "articles");
const OUT = path.join(DOCS, "articles");

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const inline = (s) => {
  let t = esc(s);
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => `<img src="${url}" alt="${alt}">`);
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
  return t;
};
function markdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let paragraph = [], list = null, quote = [];
  const flushP = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join(" "))}</p>`); paragraph = []; } };
  const flushList = () => { if (list) { out.push(`<${list}>${listItems.map(x => `<li>${inline(x)}</li>`).join("")}</${list}>`); list = null; listItems = []; } };
  const flushQuote = () => { if (quote.length) { out.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`); quote = []; } };
  let listItems = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushP(); flushList(); flushQuote(); continue; }
    const h = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (h) { flushP(); flushList(); flushQuote(); const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); continue; }
    if (trimmed.startsWith(">")) { flushP(); flushList(); quote.push(trimmed.replace(/^>\s?/, "")); continue; }
    const ul = trimmed.match(/^[-*]\s+(.+)$/);
    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ul || ol) {
      flushP(); flushQuote();
      const kind = ul ? "ul" : "ol";
      if (list && list !== kind) flushList();
      if (!list) list = kind;
      listItems.push((ul || ol)[1]); continue;
    }
    flushList(); flushQuote(); paragraph.push(trimmed);
  }
  flushP(); flushList(); flushQuote();
  return out.join("\n");
}
function readArticle(file) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing JSON front matter in ${file}`);
  const meta = JSON.parse(match[1]);
  const body = match[2].trim();
  const required = ["title", "slug", "category", "date", "status", "description"];
  for (const key of required) if (!meta[key]) throw new Error(`${key} is required in ${file}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) throw new Error(`Invalid slug "${meta.slug}" in ${file}`);
  if (!["draft", "published"].includes(meta.status)) throw new Error(`status must be draft or published in ${file}`);
  const words = body.replace(/[#>*_\[\]()`!-]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = meta.readingTime || `${Math.max(1, Math.ceil(words / 220))} min read`;
  const categorySlug = meta.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { ...meta, body, html: markdown(body), readingTime, categorySlug, words };
}
fs.mkdirSync(OUT, { recursive: true });
for (const name of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, name), { recursive: true, force: true });
const files = fs.readdirSync(SOURCE).filter(n => n.endsWith(".md") && !n.startsWith("ARTICLE-")).sort();
const all = files.map(n => readArticle(path.join(SOURCE, n)));
const published = all.filter(a => a.status === "published").sort((a,b) => b.date.localeCompare(a.date));
const slugs = new Set();
for (const a of published) {
  if (slugs.has(a.slug)) throw new Error(`Duplicate article slug: ${a.slug}`);
  slugs.add(a.slug);
  const folder = path.join(OUT, a.slug);
  fs.mkdirSync(folder, { recursive: true });
  const dateLabel = new Date(`${a.date}T12:00:00Z`).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#080b10"><meta name="description" content="${esc(a.description)}">
<title>${esc(a.title)} — OMNIA</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../css/style.css"></head><body>
<a class="skip-link" href="#article">Skip to article</a>
<header class="site-header"><div class="wrap nav">
<a class="brand" href="../../index.html" aria-label="OMNIA home"><span class="moon-mark" aria-hidden="true"></span><span class="brand-word">OMNIA<span>.</span></span></a>
<nav class="nav-links" aria-label="Main navigation"><a href="../../index.html#journal">Journal</a><a href="../../index.html#ideas">Ideas</a><a class="nav-about" href="../../index.html#about">About OMNIA</a></nav></div></header>
<main id="article"><header class="article-hero"><div class="wrap">
<a class="article-back" href="../../index.html#journal">← Back to the journal</a>
<div class="article-meta">${esc(a.category)} · ${esc(dateLabel)} · ${esc(a.readingTime)}</div>
<h1 class="article-title">${esc(a.title)}</h1><p class="article-deck">${esc(a.description)}</p>
</div></header><article class="article-body">${a.html}<div class="article-end">OMNIA · Look closer. Think wider.</div>
<div class="article-pagination"><a href="../../index.html#journal">← Return to journal</a><a href="../../index.html">OMNIA home ↑</a></div></article></main>
<footer class="footer"><div class="wrap footer-inner"><div><span class="footer-brand">OMNIA.</span><span> &nbsp; Look closer. Think wider.</span></div><div class="footer-links"><a href="../../index.html#journal">Journal</a><a href="../../index.html">Home ↑</a></div><span>© ${new Date().getFullYear()} OMNIA</span></div></footer>
</body></html>`;
  fs.writeFileSync(path.join(folder, "index.html"), html);
}
const data = published.map(a => ({
  title: a.title, description: a.description, category: a.category, categorySlug: a.categorySlug,
  date: a.date, dateLabel: new Date(`${a.date}T12:00:00Z`).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }),
  readingTime: a.readingTime, keywords: a.keywords || "", url: `articles/${a.slug}/`
}));
fs.writeFileSync(path.join(DOCS, "content", "generated-articles.js"),
  "/* Generated automatically. Do not edit this file. */\nwindow.OMNIA_ARTICLES = " + JSON.stringify(data, null, 2) + ";\n");
console.log(`Built ${published.length} published article(s); excluded ${all.length - published.length} draft(s).`);
