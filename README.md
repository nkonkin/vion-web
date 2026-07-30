# Vion Konger — Official Site

Minimal artist website for Vion Konger. Built with Next.js, Convex, and Tailwind CSS. Deployed on Vercel.

**Live:** [vion-web.vercel.app](https://vion-web.vercel.app)  
**Admin:** [/admin](https://vion-web.vercel.app/admin)

## Features

- Full-screen hero with logo and press photo
- Latest releases (editable without redeploy)
- Upcoming show dates
- Contact form with social links
- Password-gated `/admin` panel for content management

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Set these in **`.env.local`** (Next.js):

- `NEXT_PUBLIC_CONVEX_URL` — from your Convex project dashboard
- `ADMIN_PASSWORD` — password for `/admin` login

Set this in the **Convex dashboard** (Settings → Environment Variables):

- `ADMIN_SECRET` — shared secret for admin mutations (use a long random string)

Use the same value pattern: `ADMIN_PASSWORD` is what you type on `/admin`; `ADMIN_SECRET` is what Convex validates server-side.

### 3. Link Convex project

If not already linked:

```bash
npx convex dev --configure=existing --project vk-web
```

### 4. Run dev server

```bash
npm run dev
```

This starts Convex and Next.js together. Open [http://localhost:3000](http://localhost:3000).

### 5. Seed placeholder content

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Log in with your `ADMIN_PASSWORD`
3. Click **Seed placeholders**

## Admin

Visit `/admin` to manage:

- Releases
- Show dates
- Social links and booking email
- Contact form submissions

Changes appear on the live site immediately — no redeploy needed.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial Vion Konger site"
git push -u origin main
```

### 2. Import on Vercel

Project is linked as **`nkprojects/vion-web`**.

Production env vars to set in the Vercel dashboard (or via CLI):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex **production** URL (e.g. `https://determined-rabbit-361.convex.cloud`) |
| `ADMIN_PASSWORD` | Password for `/admin` login |
| `ADMIN_SECRET` | Same value as `ADMIN_SECRET` in Convex production env |

Also set in **Convex production** (Settings → Environment Variables):

- `ADMIN_SECRET` — must match Vercel `ADMIN_SECRET`

### 3. Deploy Convex to production

```bash
npx convex deploy
```

Ensure `ADMIN_SECRET` is set in the **production** Convex deployment too.

### 4. Redeploy Vercel (if needed)

After Convex prod URL is confirmed, trigger a Vercel redeploy so env vars are picked up.

## Project structure

```
src/
  app/           # Next.js routes + admin actions
  components/    # UI sections
convex/          # Schema, queries, mutations
public/          # Logo + press photo
```

## Design

See [`.impeccable.md`](.impeccable.md) for brand and UI principles.
