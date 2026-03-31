# Luna Beauty — Setup & Deployment Guide

## Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- An Anthropic API key
- An Amazon Associates account

---

## Step 1 — Install Dependencies

```bash
cd luna-beauty
npm install
```

---

## Step 2 — Amazon Associates Setup

1. Sign up at **https://affiliate-program.amazon.com**
2. Apply and get approved (usually instant for existing Amazon accounts)
3. Navigate to **Product Linking → Tracking IDs**
4. Copy your tracking ID (e.g. `lunabeauty-20`)
5. Replace `lunabeauty-20` in `.env.local` with your actual tag

> **Important:** All affiliate links in `lib/products.ts` use your `NEXT_PUBLIC_AMAZON_TAG` env variable automatically.

---

## Step 3 — Supabase Setup

1. Create a project at **https://supabase.com** (free tier works)
2. Go to **Project Settings → API**
3. Copy your **Project URL** and **anon key**
4. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
5. This creates:
   - `profiles` table (anonymous behavioral profiles)
   - `events` table (analytics tracking)
   - `products` table with pgvector support
   - Row Level Security policies
   - Vector similarity search function

---

## Step 4 — Anthropic API Key

1. Go to **https://console.anthropic.com**
2. Create an API key
3. Add it to your `.env.local`

---

## Step 5 — Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-api03-your-key
NEXT_PUBLIC_AMAZON_TAG=your-tag-20
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_SECRET=choose-a-strong-secret
```

---

## Step 6 — Run Locally

```bash
npm run dev
```

Open **http://localhost:3000**

---

## Step 7 — Deploy to Vercel (One-Click)

1. Push your code to GitHub
2. Go to **https://vercel.com** → New Project → Import your repo
3. Add all environment variables in Vercel's dashboard
4. Deploy!

Vercel automatically handles:
- Edge runtime for streaming chat responses
- Analytics (no setup needed)
- Image optimization
- CDN caching

---

## Customization

### Replace Placeholder Product Images
The current setup uses Unsplash placeholder images. For production:
1. Find actual Amazon product images (right-click → Copy Image URL on Amazon product pages)
2. Update `imageUrl` values in `lib/products.ts`
3. Add Amazon's image domains to `next.config.ts`

### Add Your Amazon Tag to All Links
Your tag is automatically injected via the `NEXT_PUBLIC_AMAZON_TAG` environment variable.
All `amz()` calls in `lib/products.ts` use this tag.

### Update Product ASINs
Each product in `lib/products.ts` has an Amazon ASIN in the `amz()` call.
Verify these are current by checking them on Amazon before launch.

### Customize the Brand
- Colors: `tailwind.config.ts` → `luna.*` colors
- Fonts: `app/globals.css` → Google Fonts import
- Logo: `components/Navigation.tsx` → Logo component

---

## Admin Analytics

Visit `/admin/analytics?secret=YOUR_ADMIN_SECRET` to view:
- Page views, affiliate clicks, chat messages
- Top products by clicks
- Revenue estimates

---

## Architecture Overview

```
Luna Beauty
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── chat/           # Streaming AI chat (edge runtime)
│   │   ├── recommendations/ # AI recommendations
│   │   ├── track/          # Event analytics
│   │   └── profile/        # Cloud sync
│   └── ...pages
├── components/
│   ├── LunaChat.tsx        # AI chatbot (useChat hook)
│   ├── BeautyQuiz.tsx      # Quiz → profile seeding
│   ├── ProfileTracker.tsx  # Invisible behavioral tracker
│   └── RecommendationSection.tsx
├── lib/
│   ├── luna-mind.ts        # Core AI engine (Claude)
│   ├── profile.ts          # Behavioral profiling logic
│   ├── products.ts         # 60+ product seed data
│   └── analytics.ts        # Event tracking
└── supabase/
    └── schema.sql          # DB schema + pgvector setup
```

---

## Revenue Optimization Tips

1. **Luxury Beauty = 10% commission** — highest Amazon category
2. Focus on driving traffic to high-ticket items ($75–$200)
3. The chatbot is your #1 conversion driver — promote it
4. The quiz drives immediate purchase intent — link to it everywhere
5. Monitor `/admin/analytics` weekly for top-converting products
6. A/B test the "Shop on Amazon" button placement

**Estimated revenue model:**
- 10,000 monthly visitors
- 12% click-through rate = 1,200 affiliate clicks
- 5% purchase rate = 60 purchases
- $45 average order value = $2,700 in sales
- **10% commission = ~$270/month** — scales linearly with traffic
