# System Architecture — Nexora Law Firm

For detailed technical architecture, sequence diagrams, and security specifications, see:
👉 **[docs/architecture.md](docs/architecture.md)**

## Architecture Quick Reference

- **Frontend Tier**: Vanilla HTML5, Tailwind CSS 3.x, Lucide SVG Icons, Google Fonts (Playfair Display & Inter)
- **State Management**: Reactive Vanilla JavaScript with Dual-Mode storage (Browser `localStorage` fallback + Supabase Cloud Sync)
- **Database**: PostgreSQL 14+ / Supabase with 10 normalized relational tables
- **Security**: Row Level Security (RLS) on all tables with authenticated role checks on all mutating endpoints
- **Containerization**: Production Docker image with Alpine Nginx and Docker Compose
- **ERD Specification**: See **[docs/erd.md](docs/erd.md)**
