# 👋 Goodbye YouTube Shorts

A lightweight Chrome extension that completely removes **Shorts** from YouTube — both the links in the sidebar and the suggestions in the feed.

## ✨ What it does

- **Removes the "Shorts" link** from the sidebar and mini menu
- **Removes Shorts sections** (shelves and suggestions) from the homepage
- **Works in real-time** — monitors DOM changes to ensure Shorts stay hidden while browsing
- **Multi-language support** — the popup automatically translates to English, Portuguese, Spanish, Russian, and Mandarin based on your browser language

## 🛠 Technologies

- Manifest V3
- Content Script with `MutationObserver`
- Vanilla JavaScript — no external dependencies

## 📦 Installation (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/goodbye-yt-shorts.git
   ```
2. Open `chrome://extensions/` in your browser
3. Enable **Developer mode** (top right corner)
4. Click **Load unpacked**
5. Select the `goodbye-yt-shorts-extension` folder

## 📂 Structure

```
goodbye-yt-shorts-extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── content.js         # Main script — removes Shorts from the DOM
├── popup.html         # Extension popup interface
├── popup.js           # Popup logic (active/inactive status & i18n)
├── icon16.png         # 16x16 icon
├── icon48.png         # 48x48 icon
└── icon128.png        # 128x128 icon
```

## 🤝 Contributing

Contributions are very welcome! This project follows the **GitHub Flow** — a simple and efficient Git workflow.

### 🔀 Gitflow (GitHub Flow)

The `main` branch is the primary branch and must **always be stable**. Every change comes in via **Pull Request**.

```
main (always deployable)
 ├── feature/new-feature
 ├── fix/fixes-bug-x
 └── chore/updates-readme
```

#### Branch convention

| Prefix | Usage |
|---|---|
| `feature/` | New feature |
| `fix/` | Bug fix |
| `chore/` | Maintenance, docs, refactoring |

#### Step by step

1. **Fork** this repository
2. Create a **branch** from `main` with the appropriate prefix:
   ```bash
   git checkout main && git pull
   git checkout -b feature/my-feature
   ```
3. Make your changes and **commit** following the message pattern:
   ```bash
   git commit -m "feat: adds my feature"
   ```
4. Push to your fork:
   ```bash
   git push -u origin feature/my-feature
   ```
5. Open a **Pull Request** in this repository
6. Wait for **CI to pass** (automatic validation via GitHub Actions)
7. After approval and merge, the branch can be deleted

#### 📝 Commit convention

| Prefix | Example |
|---|---|
| `feat:` | `feat: adds dark mode to popup` |
| `fix:` | `fix: fixes shorts not being hidden` |
| `chore:` | `chore: updates README` |
| `refactor:` | `refactor: simplifies MutationObserver logic` |

### ⚙️ CI/CD (GitHub Actions)

The project has automated pipelines that run on the GitHub Actions **free** plan:

| Workflow | Trigger | What it does |
|---|---|---|
| **CI** | Push to `main` + PRs | Validates `manifest.json` + JavaScript lint |
| **Version Bump** | Push to `main` | Analyzes commits (`fix/feat`), updates `manifest.json` and creates tag automatically |
| **Release** | Tags `v*` | Generates extension `.zip` + creates GitHub Release |

> CI runs automatically on every Pull Request. Make sure checks pass before requesting review.

### 🚀 Releases (Automated)

Releases are now **100% automated** by GitHub Actions.

To create a new release, you just need to merge a Pull Request into `main` containing commits following the **Conventional Commits** pattern:

- Commits `fix:` → Bump **patch** (ex: 1.0.0 → 1.0.1)
- Commits `feat:` → Bump **minor** (ex: 1.0.0 → 1.1.0)
- Commits with `BREAKING CHANGE:` → Bump **major** (ex: 1.0.0 → 2.0.0)

The `Version Bump` workflow will automatically:
1. Update version in `manifest.json`
2. Commit this change to `main`
3. Create a new tag (ex: `v1.3.0`)

Creating the tag will, in turn, trigger the **Release** workflow, which will:
1. Package the extension into a `.zip`
2. Create a **GitHub Release** with automatically generated release notes

### 💡 Tips for contributing

- Keep the code simple and without external dependencies
- Test your changes by loading the extension locally before opening a PR
- Clearly describe what your change does and why
- Follow the branch and commit convention described above

## 🐛 Issues

Found a bug or have a suggestion? Open an [Issue](../../issues) on GitHub!

When creating an issue, please try to include:

- **Clear description** of the problem or suggestion
- **Steps to reproduce** (for bugs)
- **Browser version** you are using
- **Screenshots**, if possible

Every contribution counts — from reporting a bug to suggesting an improvement. 🙌

## 📄 License

MIT
