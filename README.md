# Sean Kane — Portfolio

A responsive electrical engineering portfolio in charcoal, ivory, and muted brass. Built with HTML, CSS, and JavaScript. No build step or package installation is required to run the site.

## Preview

Open `index.html` in a browser. All content, filters, project dialogs, and the resume link work locally. The two web fonts load from Google Fonts; system fonts remain available offline.

For a local HTTP preview, run `node preview.mjs` with Node.js installed, then open http://localhost:4173. Stop the server with Ctrl+C.

## GitHub Pages

Public address: https://kanesea2542.github.io/

The published repository uses GitHub Pages' **Deploy from a branch** setting with `main` and `/ (root)`. Commit changes to `main` to update the website. No custom workflow is needed for this configuration.

### Optional Actions deployment

The local workspace also includes `.github/workflows/deploy.yml` if you prefer an explicit deployment workflow. To switch:

1. Open the public repository `kanesea2542/kanesea2542.github.io`.
2. Upload `.github/workflows/deploy.yml` to the `main` branch. Do not upload `.local/`.
3. In the repository's **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
4. Run **Deploy portfolio to GitHub Pages** from the Actions tab, or push a change to `main`.

The workflow deploys only the public site files. Following successful deployment, later pushes to `main` update the website automatically. See [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Alternatively, upload the public files through GitHub's web interface, select **Deploy from a branch**, and use `main` with `/ (root)` as the publishing source; omit the Actions workflow for that approach.

## Edit content

- Main text, contact links, project cards: `index.html`.
- Project detail dialogs: the `projectData` object in `script.js`.
- Palette, typography, layout: `styles.css`.
- Resume: replace `assets/Sean_Kane_Resume.pdf` while retaining the filename.
- Icon: `assets/favicon.svg`.

The BLE project page is in `projects/ble-beacon.html`, with its styles and image-viewer logic beside it. The zoomable schematic is rendered from the original PDF, and the original PDF and STEP board model are included in `assets/ble-beacon/`. The homepage currently uses this actual schematic as the project preview. The five supplied screenshots still need local image files before the board-photo gallery can be included; the prepared gallery template remains in the ignored local workspace. The other three projects have text cards pending their project images. Current projects are labeled in progress. No performance metrics or completion dates are inferred.

The background animation respects the operating system's reduced-motion setting, can be paused using the footer control, and pauses when the page is not visible. Navigation, filters, and dialogs support keyboard interaction. The contact button opens an email application; the site has no backend, tracking, or contact form.
