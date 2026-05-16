# SmartBookMark

A full-stack bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can save, organize, and manage their bookmarks with real-time sync across tabs — all behind Google authentication.

**Live Demo:** [smart-booking-app-black.vercel.app](https://smart-booking-app-black.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Backend / Auth / DB | Supabase (Google OAuth, PostgreSQL, Realtime) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Features

- Google OAuth login — no email/password
- Add, edit, and delete bookmarks
- Private bookmarks per user enforced at the database level (RLS)
- Real-time sync across browser tabs using Supabase Realtime
- Delete confirmation modal to prevent accidental deletes
- Responsive UI — mobile card layout + desktop table layout
- Edit bookmark — bonus feature (see below)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/shirisha9666/Smart_booking_app
cd smart-bookmark-app/client
npm install
```

### 2. Environment variables

Create a `.env.local` file in the `client` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vlfjndqbvisnbromnkjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZmpuZHFidmlzbmJyb21ua2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODc3NjYsImV4cCI6MjA4NjU2Mzc2Nn0.EhB27Ag-vX3pe8D_-3YJePLCmNM5TFsdfYqZdcbY9WM
NEXT_PUBLIC_SITE_URL=http://localhost:3000

### 3. Run locally

```bash
npm run dev
```

---

## How I Set Up Supabase Auth and RLS

### Google OAuth

I enabled the Google provider in Supabase under **Authentication → Providers → Google**, and configured the OAuth client in Google Cloud Console with the Supabase callback URL (`https://your-project.supabase.co/auth/v1/callback`) as an authorized redirect URI.

In the app, login is triggered using:

```js
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  }
})
```

### Row Level Security (RLS)

RLS is enabled on the `bookmarks` table. Every policy checks `auth.uid() = user_id`, ensuring users can only access their own bookmarks. This is enforced at the database level — even if someone bypasses the frontend, the database will reject unauthorized queries.

The policies I created:

| Policy | Operation | Rule |
|---|---|---|
| Users can view their own bookmarks | SELECT | `auth.uid() = user_id` |
| Users can insert their own bookmarks | INSERT | `auth.uid() = user_id` |
| Users can update their own bookmarks | UPDATE | `auth.uid() = user_id` |
| Users can delete their own bookmarks | DELETE | `auth.uid() = user_id` |
| Allow select own bookmarks for realtime | SELECT | `auth.uid() = user_id` |

These policies are correct because:
- They use `auth.uid()` which is the verified Supabase user ID from the JWT token — it cannot be spoofed by the client
- They are applied to all operations so there is no way to read, write, or delete another user's data

---

## How I Implemented Real-Time Sync

I used **Supabase Realtime postgres_changes** to listen for any changes to the `bookmarks` table and reload the bookmark list whenever a change is detected.

```js
const channel = supabase
  .channel("realtime-bookmarks")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "bookmarks" },
    (payload) => {
      loadBookmarks(); // refetch on any change
    }
  )
  .subscribe();
```

I also set the Realtime auth token from the active session so RLS applies to the Realtime connection too:

```js
const { data: { session } } = await supabase.auth.getSession();
if (session?.access_token) {
  supabase.realtime.setAuth(session.access_token);
}
```

### Subscription cleanup

I used a `useRef` to track the channel and prevent duplicate subscriptions (which can happen in React Strict Mode with double renders). On component unmount, the channel is removed:

```js
return () => {
  if (channelRef.current) {
    supabase.removeChannel(channelRef.current);
    channelRef.current = null;
  }
};
```

**Result:** Open two browser tabs, add a bookmark in one — it appears in the other instantly without any page refresh.

---

## Bonus Feature — Edit Bookmark

I added the ability to **edit an existing bookmark's title and URL**.

### Why I chose this

A bookmark manager without editing is incomplete — users inevitably save a wrong URL or want to rename a bookmark. Edit is the most natural feature to add after add and delete, and it makes the app genuinely useful for long-term use rather than just a demo.

### How it works

- Each bookmark row has an edit icon (pencil) that navigates to `/bookmarkUpdate/[id]`
- The edit page fetches the existing bookmark data and pre-fills the form
- On save, it calls a Supabase `update` query protected by the same RLS policies
- After saving, the user is redirected back to the dashboard and the updated bookmark reflects immediately

---

## Problems I Ran Into and How I Solved Them

**1. Realtime not working locally**

The Supabase Realtime connection was failing locally because the auth token wasn't being passed. I fixed this by explicitly calling `supabase.realtime.setAuth(session.access_token)` before subscribing to the channel.

**2. Google OAuth redirecting to production instead of localhost**

When running locally, the OAuth callback was going to the Vercel deployment URL instead of `localhost:3000`. I fixed this by setting `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local` and adding `http://localhost:3000/auth/callback` to the authorized redirect URIs in Google Cloud Console.

**3. Delete modal rendering multiple times**

The confirmation modal was placed inside the `.map()` loop, which caused it to render once per bookmark row. I moved it outside the map — just before the closing tag of the main component — so it renders once and is controlled by a single `deleteId` state.

**4. Mobile table layout breaking**

The bookmark table was squishing columns on small screens. I fixed this by rendering a card-based layout on mobile (`block md:hidden`) and keeping the table only for desktop (`hidden md:block`).

---

## One Thing I Would Improve With More Time

I would add **search and filter** functionality — letting users search bookmarks by title or filter by date. Right now all bookmarks are shown in a flat list. As the number of bookmarks grows, this becomes hard to navigate. A search bar at the top of the dashboard with instant client-side filtering would make the app significantly more useful for power users.