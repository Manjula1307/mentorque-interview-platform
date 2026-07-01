# Mentorque — AI Mock Interview Platform

Live demo: https://mentorque-interview-platform.vercel.app/

## Local Setup
1. `git clone [your repo url]`
2. `cd backend && npm install`
3. Create `backend/.env` with DATABASE_URL, JWT_SECRET, GROQ_API_KEY, PORT
4. `npm run dev` (from backend)
5. In a new terminal: `cd frontend && npm install && npm run dev`

## Stack
React + Vite, Node/Express, PostgreSQL (Supabase), JWT auth, Groq (Llama 3.3 70B) for the conversation engine, Web Speech API for voice (browser-native STT/TTS, chosen to avoid third-party voice service costs).

## Core Loop
Every candidate turn is transcribed via Web Speech API, appended to the session's message history in Postgres, and the full history is sent to the LLM on each turn — so every response is grounded in the actual conversation, not a fixed script.
