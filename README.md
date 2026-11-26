# CampusGPT

A student-facing AI workspace for asking questions about syllabus PDFs, looking up semester topics and generating study notes from uploaded documents.

## What it supports

- Chat backed by a hosted AI provider, including Groq or OpenRouter
- PDF upload, document retrieval and OCR for supported scanned pages
- Syllabus queries such as **Semester 1 ka syllabus batao**
- Browser-saved chat history, planner entries and preferences

## Project layout

| Path | Purpose |
| --- | --- |
| [frontend](frontend/) | Next.js interface and server-side API proxy |
| [backend](backend/) | Python API, document processing, retrieval and provider integration |
| [compose.yaml](compose.yaml) | Self-hosted frontend, backend and Caddy gateway |
| [DEPLOY.md](DEPLOY.md) | Railway and Vercel setup, environment variables and Docker Compose |

## Deployment

Follow [DEPLOY.md](DEPLOY.md) to deploy the backend on Railway and the frontend on Vercel. Configure the provider key on the backend and set the same proxy token on both services. Visitors can use chat without creating an account.
