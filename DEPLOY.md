# Deploy CampusGPT

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

## Optional Google sign-in

Create a **Web application** OAuth client in Google Cloud. Register `https://YOUR_DOMAIN/api/campus/auth/callback` as an authorized redirect URI. Add the client ID and client secret to `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the server's `.env`. Generate a session secret with `openssl rand -hex 32` and save it as `CAMPUSGPT_SESSION_SECRET`. Redeploy the backend to activate **Continue with Google** in chat. For local preview, set `CAMPUSGPT_PUBLIC_URL=http://127.0.0.1:3000` in `backend/.env` and register `http://127.0.0.1:3000/api/campus/auth/callback` for that client.

Google sign-in identifies the user in the browser session. It leaves the gateway login in place and does not sync chat history across browsers. `CAMPUSGPT_CREATOR_NAME` defaults to Keshav Jangid.
