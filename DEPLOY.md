# Deploy CampusGPT

## Railway backend and Vercel frontend

1. In Railway, link the GitHub repo and name the service `backend`. Set its root directory to `/backend` so Railway uses the backend Dockerfile. Set the health check path to `/`. Generate a public backend domain with target port `8001`.
2. In Railway backend Variables, set `CAMPUSGPT_AI_PROVIDER=groq` and your `GROQ_API_KEY`, or select OpenRouter with `CAMPUSGPT_AI_PROVIDER=openrouter`, `OPENROUTER_API_KEY`, and `OPENROUTER_MODEL=openrouter/free`. Set `CAMPUSGPT_PROXY_TOKEN` to a random server-only secret. To preserve PDF indexes and chat memory, attach a volume at `/app/database` and set `RAILWAY_RUN_UID=0` for volume permissions.
3. In Vercel, import the same GitHub repo with framework **Next.js**, root directory `frontend`, and build command `npm run build`. Set these Vercel environment variables before deploying:

   | Variable | Value |
   | --- | --- |
   | `CAMPUSGPT_BACKEND_URL` | The Railway backend HTTPS origin, without a path |
   | `CAMPUSGPT_PROXY_TOKEN` | Exactly the same secret as in Railway |

4. Open the Vercel domain and click **Launch AI**. Upload the syllabus and ask **Semester 1 ka syllabus batao** to verify. Start with PDFs under 4 MB on Vercel. For larger uploads, check whether your project supports the larger request-body feature. Keep the API key on Railway.

Visitors can open chat without an account. Chat history, the last selected conversation, planner entries, and settings are saved in the current browser and site. These do not sync across browsers. Public chat requests consume your provider quota.

## Docker Compose on a Linux server

The bundle runs the landing page, chat, PDF workflows, and hosted AI API integrations on a Linux host with Docker Compose v2. The host needs a domain pointing to it and inbound ports 80 and 443 available. Only Caddy is published. It serves HTTPS and requires a login before forwarding requests to the app.

1. Upload and extract this bundle on your host. From the extracted project directory, copy `.env.deploy.example` to `.env`. Set `CAMPUSGPT_DOMAIN` to your domain without a scheme or path.
2. Choose a provider and configure its key in `.env`. Use `CAMPUSGPT_AI_PROVIDER=groq` and `GROQ_API_KEY` for GroqCloud, or `xai` and `XAI_API_KEY` for direct Grok. For OpenRouter use `openrouter` and `OPENROUTER_API_KEY`. Direct OpenAI and Gemini use `openai` / `OPENAI_API_KEY` and `gemini` / `GEMINI_API_KEY`. Create a key in your provider account and keep it on the server.
3. Set your login password by running the command below. Paste the resulting hash inside the single quotes in `CAMPUSGPT_PASSWORD_HASH`. Use a password you have not used elsewhere.

   ```sh
   docker run --rm -it caddy:2.10-alpine caddy hash-password
   ```

4. Start the deployment.

   ```sh
   docker compose up -d --build
   ```

5. Open your domain over HTTPS. Sign in with `CAMPUSGPT_USER` and the password from step 3. Click **Launch AI** and send a message to verify provider access.

For startup errors, run `docker compose logs --tail=100 gateway frontend backend` on the host. The `campus_data` volume stores chat memory and PDF indexes. Keep it when updating the deployment. Browser-saved settings and chat history remain tied to the browser and domain where they were saved.

Provider credentials and the deployment password are supplied by the owner. Chat prompts and relevant document evidence go to the chosen hosted AI provider. Detailed PDF notes are extracted on the backend.

The backend container includes English and Hindi OCR data for scanned syllabi. Rebuild the backend to install it, then re-upload PDFs previously indexed without OCR. Uploads report any pages without readable text, including scanned pages left after the OCR time budget.

`CAMPUSGPT_CREATOR_NAME` defaults to Keshav Jangid.
