import hmac
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from rag.pdf_routes import router as pdf_router
from rag.rag_routes import router as rag_router
from rag.document_routes import router as document_router

from services.chat_routes import router as chat_router
from services.google_auth import router as auth_router
from services.website_routes import router as website_router
from services.deep_search_routes import router as deep_search_router
from services.personality_routes import router as personality_router

from memory.memory_routes import router as memory_router


app = FastAPI(
    title="CampusGPT AI Engine",
    version="1.7.0",
    description="CampusGPT Personal Intelligence Engine"
)


@app.middleware("http")
async def require_frontend_token(request: Request, call_next):
    if request.method == "GET" and request.url.path == "/":
        return await call_next(request)
    token = os.getenv("CAMPUSGPT_PROXY_TOKEN", "")
    if os.getenv("RAILWAY_ENVIRONMENT_ID") and not token:
        return JSONResponse({"detail": "Configure the frontend connection on Railway."}, status_code=503)
    if token:
        supplied = request.headers.get("x-campusgpt-proxy-token", "")
        if not hmac.compare_digest(supplied.encode(), token.encode()):
            return JSONResponse({"detail": "CampusGPT frontend authorization required."}, status_code=401)
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],

    allow_credentials=False,

    allow_methods=[
        "GET",
        "POST",
        "DELETE",
        "OPTIONS"
    ],

    allow_headers=[
        "Content-Type"
    ]
)


app.include_router(pdf_router)
app.include_router(rag_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(document_router)
app.include_router(website_router)
app.include_router(deep_search_router)
app.include_router(memory_router)
app.include_router(personality_router)


@app.get("/")
def home():

    return {
        "name": "CampusGPT",

        "engine": "Hosted AI + Document Search + Web Intelligence",

        "status": "online",

        "version": "1.7.0",

        "features": [
            "AI Chat",
            "PDF Upload",
            "PDF Search",
            "PDF Summary",
            "Document Question Answering",
            "Live Internet Search",
            "Website Reading",
            "Website Summarization",
            "Website Question Answering",
            "Automatic URL Detection",
            "Deep Web Search",
            "Conversation Memory",
            "Memory Management",
            "Conversation History",
            "Custom AI Personality",
            "Automatic Personality Detection",
            "Manual Personality Selection"
        ]
    }
