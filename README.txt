OMNIA — MODULAR GITHUB PAGES VERSION

UPLOAD
1. Extract this ZIP.
2. In your GitHub repository, replace the contents of the existing docs folder with the docs folder in this package.
3. Keep GitHub Pages set to Branch: main, Folder: /docs.
4. Commit the files. GitHub Pages will publish the updated site.

WHERE TO EDIT
- docs/content/site.js  : words, homepage headline, featured idea, journal cards, short thoughts, About text.
- docs/css/style.css    : colors, fonts, sizes, spacing, layout, mobile styling.
- docs/js/main.js       : behavior such as mobile navigation, filters and search.
- docs/index.html       : page structure and which sections appear.

MOST COMMON EDITS
- Change a sentence or add an article card: edit docs/content/site.js.
- Change the moonlight blue color: edit --accent near the top of docs/css/style.css.
- Change the display font: edit --serif near the top of docs/css/style.css.
- Change mobile menu/filter behavior: edit docs/js/main.js.

IMPORTANT
Do not rename or move the content, css or js folders unless you also update the file paths in docs/index.html.
This is a static site and works with GitHub Pages; no build step or backend is required.
