## goodbye-youtube-shorts

A lightweight Chrome extension (Manifest V3) to remove YouTube Shorts. Vanilla JavaScript, no external dependencies.

## Policy

- Never commit directly to `main`; use PRs (GitHub Flow).
- Branch names must use prefixes: `feature/`, `fix/`, or `chore/`.
- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`) to trigger automated CI/CD version bumping. Do not bump versions in `manifest.json` manually.

## Where things are

- Main extension logic (DOM manipulation): `content.js`
- Popup interface and logic: `popup.html` and `popup.js`

## Running and verifying

- No build step required. Load the `c:\repos\goodbye-youtube-shorts` folder as an unpacked extension in `chrome://extensions/`.

## Conventions that differ from defaults

- Use Vanilla JavaScript only; do not introduce external dependencies or build tools.
