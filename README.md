# Algoradar

**A competitive programming super-dashboard.** One place for everything you'd otherwise have five tabs open for.

🌐 **Live:** [algoradar.vercel.app](https://algoradar.vercel.app)

---

## What it does

Algoradar aggregates your competitive programming life across Codeforces, LeetCode, CodeChef, and AtCoder into a single dashboard — with AI-powered practice, profile analytics, and a contest calendar that actually covers everywhere you compete.

| Feature | Description |
|---|---|
| **Profile Analysis** | Deep breakdown of your Codeforces profile — rating history, problem difficulty distribution, tag-level weaknesses |
| **AI Problem Generation** | Gemini-powered practice problems personalised to your weak tags and current rating range |
| **Contest Tracker** | Upcoming contests from all four platforms in one calendar with direct links |
| **LeetCode Daily** | Today's LeetCode daily problem, surfaced without opening a second tab |
| **Rivalry Mode** | Drop two Codeforces handles — get a side-by-side breakdown of rating, solved count, strong and weak tags |
| **Goal Tracker** | Set custom goals, track daily problem-solving streaks, log your own calendar events |

---

## Architecture

**No backend server.** All personal user data — goals, streaks, calendar events — is stored as JSON in the user's own Google Drive via the Drive API. The app reads and writes directly to the user's Drive after Google OAuth sign-in.

This means:
- Zero infrastructure cost on my end
- User owns their data completely — I hold nothing
- No database to breach

Browser cache sits on top of the Drive layer for fast reads. Cache invalidation logic determines when to trust cached data vs. re-fetch from Drive.

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Auth:** Google OAuth 2.0 (with refresh token handling)
- **Storage:** Google Drive API (JSON files per user)
- **AI:** Gemini API (structured JSON output via prompt engineering)
- **APIs:** Codeforces API, LeetCode (third-party endpoint), CodeChef & AtCoder contest feeds
- **Deployment:** Vercel

---

## What was technically interesting

**The storage layer.** Using Google Drive as a key-value store for user data is unconventional. The Drive API is built for document management, not fast reads, so a browser cache layer was necessary. Getting cache invalidation right — knowing exactly when stale data should trigger a re-fetch — was the hardest engineering problem in the project.

**The LeetCode integration.** LeetCode has no public API. The third-party endpoint I use returns 200 with valid JSON even when the schema has changed, which caused silent rendering failures. The integration now validates response shape on ingestion before processing.

**Gemini output.** Making the AI problem generation actually usable required structured prompt engineering — specifying exact JSON schemas and fallback handling for when the model drifted from the format. The prompt does validation work that would otherwise live in a separate layer.

---

## Running locally

```bash
git clone https://github.com/Shashank-Tomar-2004/Algoradar.git
cd Algoradar
npm install
```

Create a `.env` file in the root:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

> **Note:** Google Drive and OAuth features require a Google Cloud project with the Drive API enabled and your `localhost` added as an authorised origin.

---

## Known limitations

- The LeetCode endpoint is unofficial and can change without notice. If LeetCode data is missing, this is why — the rest of the dashboard still works.
- Large Codeforces profiles (1000+ submissions) can cause slow initial loads. Pagination is partial.

---

## Author

**Shashank Tomar** — [github.com/Shashank-Tomar-2004](https://github.com/Shashank-Tomar-2004)
