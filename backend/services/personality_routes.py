
from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.personality import (
    get_identity,
    detect_personality
)

router = APIRouter(
    prefix="/personality",
    tags=["AI Personality"]
)


class PersonalityRequest(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=8000
    )


@router.get("/modes")
def get_modes():

    return {
        "status": "success",
        "default_mode": "auto",
        "modes": [
            {
                "id": "auto",
                "name": "Auto",
                "description": "Automatic personality selection"
            },
            {
                "id": "default",
                "name": "Default",
                "description": "Natural conversation"
            },
            {
                "id": "coding",
                "name": "Coding",
                "description": "Programming and debugging"
            },
            {
                "id": "study",
                "name": "Study",
                "description": "Learning and education"
            },
            {
                "id": "research",
                "name": "Research",
                "description": "Evidence-based answers"
            },
            {
                "id": "creative",
                "name": "Creative",
                "description": "Ideas and brainstorming"
            },
            {
                "id": "professional",
                "name": "Professional",
                "description": "Formal communication"
            }
        ]
    }


@router.get("/identity")
def identity():

    return get_identity()


@router.post("/detect")
def detect(request: PersonalityRequest):

    personality = detect_personality(
        request.message
    )

    return {
        "status": "success",
        "personality": personality
    }
