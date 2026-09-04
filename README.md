# SurakshaCheck 🛡️

**An AI-powered, WhatsApp-based scam message detection and family alert system — built for the users most targeted by digital fraud in India.**

Submitted for the Razorpay AI Buildathon — Open Track.

---

## The Problem

Digital fraud — fake KYC-update messages, lottery scams, parcel/customs frauds, fraudulent loan offers — disproportionately targets adults aged 40–60. They're digitally active (UPI, net banking, WhatsApp) but didn't grow up with the internet-native instinct to spot a fake link or sender.

Existing protections are generic and reactive: bank disclaimers nobody reads, government cybercrime portals only useful *after* a loss, and no way to get an instant, personal opinion on the exact message someone just received.

## The Solution

SurakshaCheck meets users where they already are — **WhatsApp**. No new app to learn, no sign-up flow. Forward a suspicious message to a dedicated number, get back an instant verdict (🟢 Safe / 🟡 Suspicious / 🔴 Scam) with a plain-language, spoken explanation.

Behind the scenes, a **two-stage detection pipeline** — a fast rule-based pattern matcher followed by an AI model for ambiguous cases — balances speed, cost, and accuracy. An optional **family verification loop** ("Ask My Family") lets users get a second, human opinion from linked family members, and guardians get privacy-respecting, status-only alerts when a scam is confirmed — never raw message content, by default.

## How It Works

```
User forwards message on WhatsApp
        │
        ▼
Meta WhatsApp Cloud API → Webhook (Express)
        │
        ▼
Screenshot? ── Yes ──► OCR (Tesseract.js) extracts text
        │
        ▼
Rule-based pattern matcher (known Indian scam formats)
        │
   No match / ambiguous
        ▼
Gemini AI classification → structured verdict + plain-language explanation
        │
        ▼
Save to MongoDB (Check record)
        │
        ├──► Text-to-Speech (voice note) generated
        │
        ▼
Reply sent back to user on WhatsApp (verdict + voice note)
        │
        ▼
User can tap "Ask My Family" → linked guardians vote (Safe/Suspicious/Scam)
        │
        ▼
Guardian gets a status-only alert if confirmed scam
```

**Primary interaction (the actual product):** WhatsApp itself — zero learning curve.
**Companion web app (React):** used by guardians to view alerts and vote on flagged messages, and by primary users optionally to browse their check history.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Messaging | WhatsApp Cloud API (Meta) |
| AI / NLP | Google Gemini (gemini-3.1-flash-lite) |
| OCR | Tesseract.js |
| Text-to-Speech | Google TTS, with browser `speechSynthesis` fallback |
| Auth | JWT + OTP (no passwords) |

## Key Features

- **WhatsApp-first scam detection** — forward a message or screenshot, get a verdict in seconds.
- **Two-stage detection**: instant rule-based matching for known scam formats, AI reasoning for ambiguous cases.
- **Voice explanations** — verdicts are read aloud, not just displayed, for users who prefer not to read dense text.
- **"Ask My Family"** — an active, consent-based verification loop where linked family members can weigh in with their own opinion on a flagged message.
- **Privacy-first guardian alerts** — family members are notified only on confirmed scams, and only get a status alert, never the message content, unless explicitly shared.
- **Role-based, secured web dashboard** — separate, protected views for primary users and guardians, with JWT-based session validation.
- **OTP-only authentication** — no passwords to remember or leak.

## Project Structure

```
suraksha-check/
├── backend/
│   ├── controllers/     # Route logic (auth, whatsapp, guardian, checks)
│   ├── models/          # Mongoose schemas (User, Check, GuardianLink, VerificationRequest, ScamPattern)
│   ├── routes/           
│   ├── services/        # Detection engine, AI service, OCR, TTS
│   ├── middleware/       # JWT auth middleware
│   └── utils/            # WhatsApp Cloud API helpers
└── frontend/
    ├── src/pages/        # Login, PrimaryDashboard, GuardianDashboard
    ├── src/components/   # ProtectedRoute, shared UI
    ├── src/context/      # AuthContext (session state)
    └── src/services/     # API service layer
```

## Running Locally

**Backend**
```bash
cd backend
npm install
# create a .env file — see .env.example
npm start
```

**Frontend**
```bash
cd frontend
npm install
# create a .env file — see .env.example
npm run dev
```

You'll need your own credentials for: MongoDB Atlas, Meta WhatsApp Cloud API (Phone Number ID + access token), and a Gemini API key.

## What's Next

This is an active final-year project, not a finished product. Honestly scoped next steps:

- **Admin panel** — a moderation queue so AI-flagged scam patterns get human review before joining the shared rule-based database, plus aggregate analytics (scam trends by category/region).
- **PWA support** — installable home-screen experience with push notifications, so guardians get alerts without needing to open WhatsApp or the dashboard.
- **Regional broadcast** — opt-in "scam wave detected in your area" alerts, and an aggregated report export for local cybercrime cells.
- **Security hardening** — hashed OTPs, word-boundary rule matching instead of substring matching, and a production-grade TTS provider.
- **Additional regional languages** beyond Hindi and English.

## Team

Built by Deepanshu, Vritika, Harshit Jethi, and Dhruv — B.Tech CSE, M.M. Engineering College (Maharishi Markandeshwar Deemed University), as a final-year project under the supervision of Dr. Neeraj Mangla.
