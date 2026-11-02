# Contributing to Nexora Law Firm

Thank you for your interest in contributing! This guide will help you get started.

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Nexora-Law-Firm.git
   cd Nexora-Law-Firm
   ```
3. **Set up** the project by following [HowToSetup.md](HowToSetup.md)
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-description
   ```

---

## 📝 Commit Convention

We use **Conventional Commits** for clear and consistent history:

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `chore:` | Build process or tooling changes |
| `style:` | Formatting, whitespace (no logic change) |
| `refactor:` | Code restructure (no feature/bug change) |
| `test:` | Adding or updating tests |
| `security:` | Security-related changes |

**Examples:**
```
feat: add PDF export for case reports
fix: correct login redirect after session expiry
docs: update HowToSetup.md with Docker instructions
chore: add .gitignore entry for .env
```

---

## 🧪 Testing Your Changes

Since this is a zero-build static site:

1. Start a local server:
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
2. Open `http://localhost:3000` (or 8080) in your browser
3. Test all pages you modified
4. Test on mobile viewport (use browser DevTools → responsive mode)
5. Verify Supabase interactions work (login, case CRUD, document upload)

---

## 🔐 Security Guidelines

- **Never** commit real credentials, passwords, or API keys
- Use placeholder values in examples (e.g., `YOUR_SUPABASE_KEY`)
- If you find a security vulnerability, please read [SECURITY.md](SECURITY.md) before opening an issue
- Preserve all RLS policies — do not remove security policies without explicit instruction

---

## 📐 Code Style

### HTML
- Use **2-space indentation**
- Follow existing class naming conventions (Tailwind utilities)
- Keep semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<footer>`)
- Every page must have a unique `<title>` and `<meta name="description">`

### SQL
- Add `IF NOT EXISTS` guards for all `CREATE TABLE` and `CREATE INDEX` statements
- Add `ON CONFLICT DO NOTHING` on seed inserts
- Use `TIMESTAMPTZ` for all timestamp columns (UTC-aware)
- Document each table block with a comment header

### CSS / Tailwind
- Follow the existing design system:
  - Burgundy: `#800020`
  - Obsidian Dark: `#0D0D0D`
  - Metallic Gold: `#C9A84C`
- Use Tailwind utility classes; avoid inline `style=""` attributes unless for dynamic values

---

## 📬 Submitting a Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request on GitHub against the `main` branch
3. Fill in the PR template with:
   - What changed and why
   - Screenshots if UI was modified
   - Any Supabase schema changes (run `schema.sql` again?)
4. Wait for review — we aim to respond within 48 hours

---

## 🐛 Reporting Bugs

Open a [GitHub Issue](https://github.com/Jakia5876/Nexora-Law-Firm/issues) with:
- Browser and OS version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or console logs if applicable

---

## 💡 Feature Requests

Open a [GitHub Discussion](https://github.com/Jakia5876/Nexora-Law-Firm/discussions) or Issue labeled `enhancement`. Describe the use case and why it would benefit users of the law firm suite.

---

Thank you for making Nexora Law Firm better! ⚖️
