# Vayu Vision

PROJECT GOAL

Build a production-quality full-stack web application called Vayu Vision, a personalized respiratory intelligence platform for people with asthma. The app should feel like a premium health-tech startup product rather than a student project. Focus on exceptional execution instead of excessive features. Use a modern, elegant interface with smooth animations, responsive layouts, accessible design, and clean architecture.

TECH STACK

Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts.
Backend: Supabase (PostgreSQL, Auth, Storage, Row Level Security).
Deployment: Vercel.
Use reusable components, clean folder structure, typed interfaces, server-side validation, environment variables, and production-ready code.

CORE FEATURES

Authentication (Email + Google), onboarding profile, dashboard, symptom logger, medication tracker, peak-flow logger, live AQI/weather, rule-based asthma risk score with explanations, VayuPrint™ personalized trigger profile, Air Story™ daily summary, Air Memory™ calendar history, What-if Lab™, analytics dashboard, profile/settings.

UI DESIGN

Design language inspired by Apple Health, Oura, Linear, and Stripe Dashboard.
Rounded cards, generous whitespace, subtle glassmorphism, deep blue/teal/emerald palette, dark and light mode, premium typography, loading skeletons, hover micro-interactions, mobile-first responsiveness.

Landing Page:
• Hero with 'Breathe Smarter. Live Better.'
• Animated background inspired by airflow.
• CTA buttons (Get Started / Live Demo)
• Feature highlights.
• Architecture preview.
• Footer.

Dashboard:
• Greeting
• Today's Risk Gauge
• AQI + Weather cards
• Medication reminder
• Air Story summary
• Symptom snapshot
• Charts (weekly/monthly)
• Quick actions

Create polished pages for:
Dashboard
Symptom Logger
Medication Tracker
Peak Flow
Air Memory
VayuPrint
What-if Lab
Analytics
Profile
Settings

BACKEND

Create normalized relational tables:
profiles, symptom_logs, medication_logs, peakflow_logs,
environment_snapshots, risk_predictions, vayuprint_profiles,
air_story_logs, user_settings.
All tables use UUID primary keys, timestamps, foreign keys and Row Level Security.

Automatically fetch environmental data using AQI and weather APIs.
Cache responses where appropriate.
Store historical environmental snapshots.

RISK ENGINE

Implement a transparent rule-based engine.
Inputs:
AQI, humidity, temperature, medication adherence, peak flow, symptom severity, sleep, exercise.
Output:
Risk score (0–100), category (Low/Moderate/High/Critical), explanation of contributing factors.
Architecture should allow replacing the rules with an ML model later.

VAYUPRINT™

Generate a personalized trigger profile showing the relative influence of AQI, humidity, temperature, smoke, exercise, sleep, medication adherence and pollen on the user's symptoms. Display as an attractive radar chart with explanatory cards.

AIR STORY™

Generate a concise daily natural-language summary explaining the user's respiratory health using recent logs and environmental data. The text should be supportive, informative and avoid medical diagnosis.

WHAT-IF LAB

Allow users to adjust sliders (AQI, humidity, medication adherence, sleep, exercise, outdoor exposure) and instantly recalculate the projected risk score using the same rule engine.

QUALITY REQUIREMENTS

Responsive across desktop/tablet/mobile.
Accessible (WCAG-minded).
Clean code.
Reusable components.
Meaningful comments.
Secure authentication.
Protected routes.
Fast loading.
Generate a professional README documenting architecture, setup, APIs, and future improvements.

FINAL INSTRUCTION

Do not generate placeholders where avoidable. Produce a polished, startup-quality MVP with connected pages, realistic sample data when APIs are unavailable, and production-ready code suitable for GitHub and Vercel deployment

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vayuvision.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c47d1924-2a17-49b7-bafa-43955c07e6ff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
