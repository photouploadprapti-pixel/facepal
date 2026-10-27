# FacePal

Mobile app for a daily selfie check, simple care tips, and face-yoga sessions.

The photo check runs on the phone. It looks at the face oval for flushed cheeks, under-eye darkness, rough texture, uneven tone, and spot-like redness. It also checks photo lighting quality, shows which face zones drove the read, estimates an appearance-load score, and can frame a face-age style note if you add a birth year. Scores are wellness estimates from the picture, not a medical diagnosis or clinical risk prediction.

Selfies are stored in a private Supabase bucket under your user id. Face-yoga routines and tips are read from Postgres.

## Run

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` to the project URL and the publishable key.
3. Install and start:

```bash
npm install
npx expo start
```

Use Expo Go on a phone for the camera, or press `w` for web. The same project exports a browser app for testing:

```bash
npm run build
```

Vercel should use that build and publish the `dist` folder. Client routes fall back to `index.html`. The publishable Supabase key is in `.env.production` so the hosted build can sign in. The database password stays out of the repo. In the Supabase dashboard, turn off email confirmation if you want sign-up to enter the app immediately (Authentication → Providers → Email).

## What is included

- Email sign-up and sign-in
- Consent before any selfie is stored
- Camera oval so daily photos line up
- On-device image check and a saved history
- Before/after slider
- Face-yoga routines with a pose animation and a timer
- Optional routine video when `yoga_routines.video_url` is set
- Tips
- Daily local reminder
- Delete photos, history, and the auth user

Paid skin SDKs (Banuba, Perfect Corp, Face++) are not bundled. Add an `https` mp4 to `video_url`, or upload a file you have rights to into the public `yoga-media` bucket and store that URL.

## Database

Schema lives in `supabase/migrations/`. Apply newer migration files in the Supabase SQL editor if your project was created from an earlier snapshot (including `birth_year` on `profiles`). Do not commit the database password. Keep it out of the app; the phone only uses the publishable key.

If that password was pasted into a chat or ticket, rotate it in the Supabase dashboard.
