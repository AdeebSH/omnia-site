# OMNIA — Private, file-based publishing

This upgrade keeps the existing OMNIA homepage design and its CSS design system. It adds a Markdown article workflow and automatic GitHub Actions publishing.

## One-time GitHub setup

1. Upload/merge the files from this package into the root of your existing repository. Keep the existing `docs/` folder and its design files.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions** (instead of Deploy from a branch).
4. Commit and push the files to the `main` branch.
5. Open the repository's **Actions** tab and wait for **Build and publish OMNIA** to finish successfully.

After that, every push to `main` automatically builds the articles and deploys the site. No one can publish through the public website; only people with write access to your GitHub repository can change the source and trigger a deployment. Keep the repository private if you have a GitHub plan that supports private-repository Pages; otherwise the source repository may be public, but visitors still cannot publish through the website. Never share your GitHub credentials or grant write access to people you do not trust.

## Add an article

1. Create one `.md` file inside `content/articles/`, for example `my-new-essay.md`.
2. Copy the format from `content/articles/ARTICLE-TEMPLATE.md`.
3. Edit the JSON metadata between the `---` lines, then write the article in Markdown below it.
4. Set `"status": "draft"` while writing. Change it to `"published"` when ready.
5. Commit the new/edited Markdown file to `main`.

That's it. GitHub Actions automatically:
- generates an individual article page;
- adds its card to the homepage;
- adds a category filter if needed;
- includes it in search;
- sorts published articles newest first;
- excludes drafts from the deployed website entirely.

## Article metadata

Required:
- `title`
- `slug` (lowercase letters/numbers/hyphens; must be unique)
- `category`
- `date` (`YYYY-MM-DD`)
- `status` (`draft` or `published`)
- `description`

Optional:
- `keywords`
- `readingTime` (otherwise estimated at 220 words/minute)
- `featured` (reserved for future featured-article placement)

## Markdown supported

Paragraphs, `##` and `###` headings, **bold**, *italic*, links, images, blockquotes, and bulleted/numbered lists.

For images, put image files in `content/images/` (create the folder if needed) and use a path appropriate to the generated article page. For reliable image paths in this current version, use a root-relative GitHub Pages path including the repository prefix only if you set it consistently; the easiest approach is to use externally hosted image URLs. Do not use untrusted HTML in article Markdown.

## Preview locally

You need Node.js 20+ and Python 3:
- Run `npm run build`
- Run `npm run preview`
- Open `http://localhost:8000`

The preview command rebuilds `docs/` first. Stop the local server with Ctrl+C.

## Files you edit

- `content/articles/*.md` — the only files you normally edit to write, revise, draft or publish articles.
- `docs/content/site.js` — existing homepage copy and About biography.
- `docs/css/style.css` — existing visual design; avoid editing unless you intentionally want a design change.

## Files you should not edit manually

- `docs/content/generated-articles.js` — generated automatically.
- `docs/articles/` — generated article pages; do not edit these directly.
- `docs/js/main.js` — site behaviour.
- `scripts/build.mjs` — article generation logic.
- `.github/workflows/pages.yml` — automatic publishing workflow.

## Security and publishing model

The public GitHub Pages site is static and read-only. It has no public admin panel, account creation, article submission endpoint, database or publishing API. Publishing authority comes from repository write permissions and GitHub Actions. A visitor cannot publish merely by visiting the site. Anyone with write access to the repository can change source files, so restrict collaborators and protect the `main` branch if needed.

## Existing design

The original homepage structure, colour variables, typography, section layout, navigation and responsive rules are retained. The only homepage copy change is the requested professional About biography; article-specific styles are appended to the existing stylesheet.
