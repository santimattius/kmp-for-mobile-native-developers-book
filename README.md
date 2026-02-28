



## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) For web metrics, copy [.env.example](.env.example) to `.env.local` and fill in the `VITE_FIREBASE_*` values from [Firebase Console](https://console.firebase.google.com/) → Project settings → Your apps → Web app. Analytics will only run when these are set.
4. Run the app:
   `npm run dev`

## Deploy with GitHub Pages

A GitHub Actions workflow builds and deploys the app to **GitHub Pages**; credentials are stored in GitHub Secrets. For the full setup (one-time Pages config, secrets, and how to deploy), see **docs**: [docs/05-desplegar-github-pages.md](docs/05-desplegar-github-pages.md).
