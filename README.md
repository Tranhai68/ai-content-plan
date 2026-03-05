# Content Automation 🚀

Nền tảng SaaS lập kế hoạch nội dung AI - Xây dựng chiến lược content marketing thông minh với AI.

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **Prisma 7** + **Turso** (SQLite cloud)
- **Google Gemini AI** (Content generation)
- **Tailwind CSS 4** + **Recharts**
- **FullCalendar** (Content calendar)

## Features

- 📊 **Dashboard** - Tổng quan hoạt động content marketing
- 📅 **Calendar** - Lịch nội dung với ngày lễ Việt Nam
- 📝 **Content Editor** - Tạo & chỉnh sửa content với AI
- 🎯 **Brand Profile** - Quản lý thương hiệu & phễu marketing
- 📈 **Report** - Báo cáo hiệu suất content
- 🧠 **AI Strategist** - Phân tích & đề xuất chiến lược AI

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Tranhai68/ai-content-plan.git
cd ai-content-plan
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - SQLite file path (local) hoặc Turso URL
- `TURSO_DATABASE_URL` - Turso database URL (production)
- `TURSO_AUTH_TOKEN` - Turso auth token (production)
- `GEMINI_API_KEY` - Google Gemini API key

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `GEMINI_API_KEY`
3. Deploy! ✨

## License

MIT
