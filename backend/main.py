
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CampusGPT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "CampusGPT Backend is running"
    }

@app.post("/chat")
def chat(request: ChatRequest):
    return {
        "reply": f"You asked: {request.message}. CampusGPT backend is connected successfully!"
    }
