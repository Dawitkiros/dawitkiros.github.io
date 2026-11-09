# Dawit Kiros Redie - personal website

A custom, compact research portfolio built with Hugo. All layouts, styles, and interactions are local to this repository; there is no HugoBlox, Bootstrap, or theme dependency.

## Local development

```sh
./bin/hugo server -D
```

Open http://localhost:1313.
Use Hugo 0.169.0, matching the GitHub Pages workflow and the local `./bin/hugo` binary.

Build the production site:

```sh
./bin/hugo --minify
python3 scripts/check-public-output.py public
```

Hugo writes the website to `public/` and cleans stale generated files on each build.
The GitHub Pages workflow builds and deploys on pushes to `main`.

## Editing content

- `layouts/index.html`: homepage introduction, research areas, and project summaries.
- `content/authors/admin/_index.md`: education, tools, and author biography.
- `content/authors/admin/avatar.jpg`: profile photo.
- `content/publication/*/index.md`: publication metadata and abstracts. The latest three appear on the homepage; the archive includes all publications and topic filters.
- Publication bundles can include `cite.bib` for a citation download and a local PDF.
- `data/home.json`: work experience and expandable descriptions, migrated from the previous homepage.
- `config/_default/params.yaml`: contact details, social links, and CV path.
- `config/_default/menus.yaml`: navigation.
- `assets/css/site.css`: responsive layout and light/dark themes.
- `assets/js/`: theme preference, archive filters, and current-section navigation.

The design uses system fonts and local SVG icons. JavaScript is optional for reading and navigating the site; experience expands through native HTML details elements. Color preferences follow the system until a visitor selects a theme.

Pages with `math: true` load pinned MathJax 3.2.2 from jsDelivr with a verified integrity hash; other pages do not load it.
See the [MathJax loading documentation](https://docs.mathjax.org/en/v3.2/web/start.html).
The gym tracker source and configuration remain in `static/tracker/`, but that directory and `content/project/gym-tracker/` are excluded from the website build through `config/_default/module.yaml`.

## Deployment security

Production HTML includes a Content Security Policy that blocks inline scripts, evaluated JavaScript, forms, frames, and network connections.
Math pages allow scripts and fonts from the pinned MathJax package path; inline styles remain allowed for syntax highlighting and MathJax.
The development server omits this policy so Hugo live reload can work.
Meta policies cannot enforce `frame-ancestors`, so this configuration does not claim to prevent other sites from framing the portfolio.

The Pages workflow pins actions to commit hashes and verifies the Hugo archive checksum before execution.
Only the deployment job receives Pages write permission and an identity token; the build job has read access.
The artifact check rejects tracker files, hidden files, common credential patterns, inline scripts, insecure URLs, and unapproved or modified JavaScript/CSS assets.
It is a focused deployment check, not a replacement for a full secret scanner.

When enabling GitHub Pages, select GitHub Actions as the build source and keep **Enforce HTTPS** enabled in the repository's Pages settings.
See [GitHub's HTTPS guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).
If the tracker is deployed separately later, verify its Supabase row-level policies and disable public signups in Supabase; the client-side email list is not an authorization boundary.

## Research area links

The homepage research areas link to the publication archive with a shareable `?topic=` filter.
Topic labels and descriptions are maintained in `data/research_areas.yaml`.
Assign publications to one or more areas through the `research_areas` front matter field, using `federated`, `communication`, and `privacy-medical`.
The same field and topic IDs can be reused for future blog posts.

## Homepage animation

The introduction animation uses `layouts/partials/federated-learning.html`, point positions in `data/federated_learning.json`, and behavior in `assets/js/federated-learning.js`.
It plays once when visible, pauses offscreen, and respects the visitor's reduced-motion preference.
Each round averages three selected model colors; the server begins white and all clients synchronize in the final broadcast.
