# 🍳 FridgeChef

AI-powered recipe generator. Type your ingredients, get recipes instantly.

## Features

- **Recipe Generator** — AI suggests 3 recipes from whatever you have
- **Weekly Meal Planner** — auto-schedules breakfast, lunch & dinner for 7 days
- **Favorites** — save recipes; syncs to the cloud when signed in
- **Grocery List** — generates a categorized shopping list for missing items
- **Google Sign-In** — save your data across devices (Firebase)
- **Diet filters** — vegetarian, vegan, halal, low-carb, gluten-free
- **Mobile-first** — works great on phone; installable as a PWA

---

## Setup (5 steps)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd fridgechef
npm install
```

### 2. Get your Anthropic API key
1. Go to https://console.anthropic.com/
2. Create an API key
3. Copy it

### 3. Set up Firebase
1. Go to https://console.firebase.google.com/
2. Create a new project (e.g. "fridgechef")
3. Add a **Web app** to the project
4. Copy the config values shown
5. In Firebase console → **Authentication** → Sign-in method → Enable **Google**
6. In Firebase console → **Firestore Database** → Create database (start in test mode)

### 4. Create your .env.local file
```bash
cp .env.local.example .env.local
```
Then open `.env.local` and fill in your keys.

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

When prompted, add your environment variables from `.env.local.example`.

Or connect your GitHub repo at https://vercel.com/new and add the env vars in the Vercel dashboard under **Settings → Environment Variables**.

---

## Project structure

```
fridgechef/
├── app/
│   ├── api/claude/route.js   ← Server-side Claude API call (keeps key secret)
│   ├── globals.css
│   ├── layout.js
│   └── page.js               ← Main app (all 4 tabs)
├── components/
│   └── AuthContext.js        ← Firebase auth state
├── lib/
│   ├── firebase.js           ← Firebase client init
│   └── db.js                 ← Firestore helpers (favorites, meal plan)
├── public/
│   └── manifest.json         ← PWA config
├── .env.local.example        ← Copy this to .env.local
├── next.config.js
└── package.json
```

---

## Firestore security rules (recommended for production)

In Firebase console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures users can only read and write their own data.
