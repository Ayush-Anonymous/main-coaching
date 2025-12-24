# Institute Compass

Complete Education Management System for institutes, schools, and training centers.

## Features

- 👨‍🎓 Student Management
- 📚 Course & Batch Management
- 👨‍🏫 Faculty Management
- 💰 Fee Management
- 📝 Tests & Marks
- 📊 Analytics Dashboard
- 🔐 Role-based Access Control

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Run MySQL schema
mysql -u your_user -p your_database < server/schema.sql

# Start development server
npm run dev
```

### Environment Variables

Set these in Hostinger hPanel (NOT in .env file for production):

```
DB_HOST=your-hostinger-db-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
JWT_SECRET=your-jwt-secret
```

> ⚠️ Do NOT set PORT - Hostinger auto-injects it

## Deployment (Hostinger)

1. Push code to GitHub
2. Connect GitHub repo in Hostinger
3. Set environment variables in hPanel
4. Deploy

## License

MIT
