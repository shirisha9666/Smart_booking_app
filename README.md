# Smart Bookmark App

A realtime bookmark manager built with **Next.js + Supabase**.  
Users can securely log in using Google OAuth, manage personal bookmarks, and see updates instantly across multiple tabs without refreshing.

---

## Live Demo

**Live URL:**  
https://smart-booking-app-black.vercel.app

---

## Features

- Google OAuth Authentication (Signup & Login)
- Add bookmark (Title + URL)
- Update bookmark
- Delete bookmark
- Private bookmarks per user (RLS security)
- Realtime updates across multiple tabs (no refresh)
- Cross-tab login/logout sync
- Deployed on Vercel

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS  
- **Backend / Database:** Supabase (Auth, Database, Realtime, RLS)  
- **Authentication:** Google OAuth via Supabase  
- **Deployment:** Vercel  

---

## How It Works

- Users authenticate using Google OAuth.
- Supabase automatically creates the user on first login.
- Each bookmark is stored with `user_id`.
- Row Level Security ensures users only access their own bookmarks.
- Supabase Realtime listens for database changes and updates UI instantly across tabs.

---

## Problems Faced & Solutions

### 1. Google OAuth Redirecting to Localhost After Deployment
**Problem:** After deploying, Google login redirected to `localhost`.

**Solution:** Configured Supabase Authentication **Site URL & Redirect URLs** correctly and used dynamic redirect:

```js
redirectTo: `${window.location.origin}/auth/callback`
```

---

### 2. Users Could See Other Users' Bookmarks
**Problem:** All users could view all bookmarks initially.

**Solution:** Implemented **Row Level Security (RLS)**:

```sql
auth.uid() = user_id
```

Now each user only accesses their own data.

---

### 3. Realtime Not Updating Across Tabs
**Problem:** Changes required page refresh.

**Solution:** Enabled Supabase Realtime and subscribed to DB changes:

```js
supabase
  .channel("realtime-bookmarks")
  .on("postgres_changes", { event: "*", schema: "public", table: "bookmarks" }, loadBookmarks)
  .subscribe();
```

Now updates sync instantly across tabs.

---

### 4. Realtime WebSocket Closing During Development
**Problem:** Realtime connection kept closing (`TIMED_OUT`).

**Solution:** Caused by React Strict Mode & Fast Refresh. Prevented double subscription and verified realtime works correctly in production.

---

### 5. Foreign Key Constraint Error While Inserting Bookmarks
**Problem:** Insert failed due to invalid `user_id`.

**Solution:** Ensured authenticated user exists before inserting:

```js
user_id: user.id
```

---

### 6. Git Push Failed Initially
**Problem:** `src refspec main does not match any`.

**Solution:** Created initial commit and removed nested `.git` folder from client directory.

---

### 7. Cross-Tab Login/Logout Not Syncing
**Problem:** Logout in one tab did not affect other tab.

**Solution:** Used `supabase.auth.onAuthStateChange()` and storage listener to sync authentication across tabs.

---

## Security

- Row Level Security (RLS) enabled
- Users can only access their own bookmarks
- Supabase handles secure authentication and tokens
- Environment variables used for sensitive keys

---

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Run Locally

```bash
git clone https://github.com/shirisha9666/Smart_booking_app.git
cd Smart_booking_app/client
npm install
npm run dev
```

---

## Deployment

Deployed on **Vercel** with environment variables configured.  
Supabase Authentication URLs configured for production redirect.

---


---

## Final Result

- Google authentication working
- Secure per-user bookmarks
- Realtime sync across tabs
- Add / Update / Delete functionality
- Successfully deployed on Vercel



Submit your work here: https://forms.gle/cHiDwq5g12wxoVgG7