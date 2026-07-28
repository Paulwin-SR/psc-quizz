# PSC Quiz Arena

A mobile quiz-battle app (React Native + Expo) for Kerala PSC exam preparation:
solo or pass-and-play opponent quiz matches (3 rounds × 20 questions, best of 2
wins), a Learn section with topic notes, a personal Notes page, Google sign-in,
and a Firestore-backed scoreboard.

## Tech stack
- **React Native + Expo** (works on Android & iOS from one codebase)
- **React Navigation** for screens
- **Firebase**: Authentication (Google) + Firestore (free Spark plan covers this app's usage easily)

## 1. Install dependencies

```bash
npm install
```

(Requires Node.js 18+ and the Expo CLI: `npm install -g expo-cli` is optional —
`npx expo start` also works without a global install.)

## 2. Set up Firebase (free)

1. Go to https://console.firebase.google.com → **Add project**.
2. Inside the project, click **Add app → Web** (yes, web — Expo apps use the
   Firebase JS SDK even on mobile) and copy the config object.
3. Paste those values into `firebaseConfig.js` (replace the `YOUR_...` placeholders).
4. **Authentication** → Sign-in method → enable **Google**.
5. **Firestore Database** → Create database → start in production mode.
6. Open the **Rules** tab in Firestore and paste the contents of `firestore.rules`
   from this project, then **Publish**.

## 3. Set up Google Sign-In OAuth client IDs

Google sign-in via Expo needs OAuth client IDs from the Google Cloud Console
(the same project Firebase created for you):

1. Go to https://console.cloud.google.com/apis/credentials and select your
   Firebase project.
2. Under **OAuth 2.0 Client IDs** you should already see a **Web client**
   (auto-created by Firebase) — copy its Client ID into `webClientId` in
   `context/AuthContext.js`.
3. Create additional client IDs for **iOS** and **Android** (Expo's docs walk
   through this: https://docs.expo.dev/guides/google-authentication/). Paste
   them into `iosClientId` / `androidClientId`.
4. For quick testing in Expo Go, the `expoClientId` (also a "Web" type client)
   lets sign-in work without a custom dev build.

## 4. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) to run it on your phone, or
press `a` / `i` in the terminal for an emulator.

## 5. Build a real installable app (later)

When you're ready to publish to the Play Store / App Store, use EAS Build:

```bash
npm install -g eas-cli
eas build -p android
eas build -p ios
```

## Project structure

```
App.js                  Navigation root
firebaseConfig.js        Firebase init (fill in your keys)
firestore.rules          Copy into Firebase console
theme.js                  Shared colors/spacing for consistent UI
context/AuthContext.js   Google sign-in + auth state
data/questions.js         PSC question bank + 3-round match builder (no repeats)
data/topics.js             Learn page content
screens/
  AuthScreen.js
  HomeScreen.js
  QuizSetupScreen.js     Choose solo vs pass-and-play opponent mode
  QuizScreen.js            Core quiz engine: 3 rounds x 20 Qs, MCQ, scoring
  ResultScreen.js          Final result + saves match to Firestore
  ScoreboardScreen.js      Personal stats + leaderboard
  LearnScreen.js            Topic list
  TopicDetailScreen.js     Notes for a chosen topic
  NotesScreen.js            Personal notes (CRUD, Firestore-synced)
```

## Growing the question bank

`data/questions.js` currently ships with ~70 curated PSC GK questions across
Kerala History, Renaissance & Social Reform, Indian Polity, Geography, General
Science, and Current Affairs — rewritten from publicly available Kerala PSC
previous-year question compilations as a starting set.

A full match needs 60 unique questions (3 × 20); for variety across many
matches you'll want several hundred. To add more:

1. Open `data/questions.js`.
2. Add objects to the `QUESTIONS` array in the same shape:
   ```js
   { category: "Kerala History", question: "...", options: ["A", "B", "C", "D"], answerIndex: 0 }
   ```
3. That's it — `buildMatchQuestions()` automatically shuffles and picks from
   the full pool with no repeats per match.

Good free sources to expand from (manually rewrite, don't paste verbatim, to
respect the original sites' content): Kerala PSC's official site
(keralapsc.gov.in) previous question papers, PSC Thriller, ExamFlare,
Kerala PSC Tips, Entri, Challenger App.

## Notes on scope

This is a complete, working app scaffold — every screen, the quiz engine,
auth, and database wiring are implemented and functional once you fill in
your Firebase keys. The two things only you can finish (because they require
your own free accounts/credentials) are: (1) entering your Firebase config
keys, and (2) creating the Google OAuth client IDs. Everything else runs out
of the box with `npx expo start`.
