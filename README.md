# 🔖 Bookmark Manager

A real-time bookmark management application built with Next.js 14,
Supabase, and Tailwind CSS.

Users authenticate via Google OAuth and manage private bookmarks with
instant synchronization across browser tabs.

------------------------------------------------------------------------

## 🚀 Overview

This project demonstrates:

-   Full-stack architecture using App Router\
-   Secure authentication with OAuth 2.0 (PKCE)\
-   Row-Level Security (RLS) enforcement\
-   Real-time database subscriptions\
-   Production deployment on Vercel

The focus was not just feature completion --- but correctness, security,
and real-time reliability.

------------------------------------------------------------------------

## ✨ Features

### Core Functionality

-   🔐 Google OAuth authentication (no password flow)\
-   ➕ Add bookmarks (title + URL)\
-   🗑 Delete bookmarks\
-   👁 Private user data (RLS enforced at database level)\
-   ⚡ Real-time sync across multiple tabs\
-   🚀 Production deployment on Vercel

### Enhancements

-   Optimistic UI updates\
-   Favicon display per bookmark\
-   Responsive UI (mobile + desktop)\
-   Indexed queries for performance\
-   Clean UI with smooth transitions\
-   Error handling & loading states\
-   Domain parsing and date formatting

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Framework: Next.js 14 (App Router)\
-   Language: TypeScript\
-   Database: PostgreSQL (Supabase)\
-   Auth: Supabase Auth (Google OAuth)\
-   Security: Row Level Security (RLS)\
-   Realtime: Supabase Realtime (WebSockets)\
-   Styling: Tailwind CSS\
-   Deployment: Vercel

------------------------------------------------------------------------

## 🔐 Security Architecture

Security is enforced at the database layer, not just the UI.

### Row Level Security (RLS)

``` sql
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
ON bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks
FOR DELETE USING (auth.uid() = user_id);
```

This ensures:

-   Users cannot access other users' data\
-   Client-side filters cannot bypass restrictions\
-   Authorization is validated server-side

------------------------------------------------------------------------

## 🗄 Database Schema

``` sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

------------------------------------------------------------------------

## ⚙️ Local Setup

### 1. Clone & Install

``` bash
git clone <repository-url>
cd bookmark-manager
npm install
```

### 2. Environment Variables

Create `.env.local`:

``` env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run

``` bash
npm run dev
```

------------------------------------------------------------------------

## 🧠 Technical Challenges Solved

### Real-time Sync Failures

-   Added `REPLICA IDENTITY FULL`\
-   Ensured correct publication configuration\
-   Stabilized client instance using `useRef`\
-   Avoided duplicate subscriptions in development

### OAuth Redirect Errors

-   Matched redirect URI exactly\
-   Corrected credential formatting\
-   Configured OAuth consent screen

### Realtime Lifecycle Issues

-   Managed WebSocket lifecycle properly\
-   Avoided duplicate subscriptions caused by Strict Mode\
-   Implemented optimistic updates for same-tab responsiveness

------------------------------------------------------------------------

## 📚 Key Takeaways

-   Real-time systems require correct DB replication configuration\
-   RLS must be treated as the primary security boundary\
-   OAuth misconfiguration is usually a redirect mismatch\
-   Client lifecycle stability is critical for WebSocket reliability\
-   Production debugging requires systematic isolation

------------------------------------------------------------------------

## 🔮 Possible Improvements

-   Edit bookmark functionality\
-   Tagging & categorization\
-   Search & filtering\
-   Folder system\
-   Bookmark previews\
-   Dark mode\
-   Sharing between users\
-   Browser extension

------------------------------------------------------------------------

## 📄 License

MIT

------------------------------------------------------------------------

## 👤 Author

Built to demonstrate full-stack engineering with authentication,
security, and real-time architecture using modern tooling.
