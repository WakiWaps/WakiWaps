# Portfolio development and publishing

This repository serves two purposes:

- `README.md` is the introduction displayed on the WakiWaps GitHub profile.
- `docs/` contains the independent static portfolio website.

## Files to edit

| File | Purpose |
| --- | --- |
| `docs/index.html` | Portfolio text, sections, profile links, and page metadata |
| `docs/styles.css` | Layout, colors, typography, and responsive behavior |
| `docs/app.js` | Project dialogs and workflow interactions |
| `docs/lab-core.js` | Sample records and validation logic |
| `docs/favicon.svg` | Browser tab icon |
| `docs/.nojekyll` | Serves the files directly without Jekyll processing |

The website needs no package installation, backend, API keys, or build step. Its workflow demo uses fictional records and does not send data to a server.

## Run locally

Clone this repository and open the folder in VS Code:

```bash
git clone https://github.com/WakiWaps/WakiWaps.git
cd WakiWaps
```

For the simplest preview, open `docs/index.html` in a browser. If Python 3 is available, you can also run:

```bash
python3 -m http.server 8080 --directory docs
```

Then open `http://localhost:8080`.

## Publish with GitHub Pages

1. Open https://github.com/WakiWaps/WakiWaps/settings/pages.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Select branch **main** and folder **/docs**.
4. Click **Save** and wait for the Pages deployment to complete.

The expected website address after successful activation is:

https://wakiwaps.github.io/WakiWaps/

Enabling Pages is a repository setting; committing these files alone does not activate it. The publishing source is `/docs`, not the repository root. After activation, later commits to `main` update the website automatically.

## Add your own domain later

After registering a domain, add it under the repository's Pages settings and configure the DNS records as described in GitHub's official custom-domain guide:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

When the domain is active, update both the `og:url` meta tag and the canonical link in `docs/index.html` to that domain. GitHub may create a `docs/CNAME` file; retain it in future changes.

## Checks

```bash
node --check docs/app.js
node --check docs/lab-core.js
```

The workflow validation and preview/confirm/reset behavior were checked during creation, alongside page structure, asset references, profile links, and project-dialog behavior. Visual browser testing was unavailable in the creation environment, so check the layout on desktop and mobile when previewing or deploying.
