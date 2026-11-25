# CampusGPT

CampusGPT has a Next.js workspace and a FastAPI backend that calls hosted AI APIs. PDF search and detailed PDF notes do not require a model download.

## Deploy with an AI API key

1. Deploy the `backend` directory as a Python web service. Install `requirements.txt` and start it with `python -m uvicorn rag_test:app --host 0.0.0.0 --port "$PORT"` on a Linux host that sets `PORT`.
2. In the backend service's secrets, set `CAMPUSGPT_AI_PROVIDER` to your provider and add its key. Use `groq` with `GROQ_API_KEY`, `xai` with `XAI_API_KEY`, `openrouter` with `OPENROUTER_API_KEY`, `openai` with `OPENAI_API_KEY`, or `gemini` with `GEMINI_API_KEY`. One key is enough. Set the corresponding `*_MODEL` variable if you want a different model.
3. Deploy the `frontend` directory. Before building Next.js, set `CAMPUSGPT_BACKEND_URL` to the hosted backend's HTTPS origin, without a route path.

Mount persistent storage at the backend's `database` directory to keep PDF indexes and conversation memory across restarts. Keep API keys in backend secrets. This app has no user authentication, so restrict access to both services before exposing a deployment that uses your provider credits. Chat prompts, relevant history, and evidence used for answers are sent to the selected provider.

## Run an optional local development server

Copy `backend/.env.example` to `backend/.env` and fill in one provider key. Then start the services from the workspace root in separate PowerShell terminals.

```powershell
cd backend
# If the development environment needs to be created:
# python -m venv venv
# .\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn rag_test:app --host 127.0.0.1 --port 8001
```

API documentation is available at [FastAPI Docs](http://127.0.0.1:8001/docs).

## Start Next.js

```powershell
cd frontend
# If dependencies need to be installed:
# npm.cmd ci
npm.cmd run dev -- --hostname 127.0.0.1
```

Open [CampusGPT Chat](http://127.0.0.1:3000/chat). Next.js forwards chat, PDF upload, and memory-clear requests to FastAPI. To use a different backend origin, set `CAMPUSGPT_BACKEND_URL` before starting the development server or creating a production build.

For a quick check, tell the assistant your favorite programming language, then ask it to recall the language in the same conversation. Open **Context usage** below a generated reply to see how many past messages and tokens were used. Attach a text-based PDF to ask questions about it. Each conversation keeps its active PDF until you remove or replace it.

The study catalog is populated with sample entries. To enable an entry, put its PDF under `public/resources` and set its `available` field in `data/resources.ts`.
