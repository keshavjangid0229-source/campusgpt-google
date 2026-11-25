
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from rag.pipeline import (
    build_rag_context,
    create_rag_prompt
)

router = APIRouter(prefix="/rag")


class RAGRequest(BaseModel):

    question: str = Field(
        min_length=1,
        max_length=2000
    )

    document_id: str | None = None

    top_k: int = Field(
        default=4,
        ge=1,
        le=10
    )


@router.post("/context")
async def get_context(request: RAGRequest):

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    result = await run_in_threadpool(
        build_rag_context,
        question,
        request.document_id,
        request.top_k
    )

    if not result["found"]:
        return {
            "status": "no_documents",
            "message": "Upload a PDF first.",
            "sources": []
        }

    prompt = create_rag_prompt(
        question,
        result["context"]
    )

    return {
        "status": "success",
        "question": question,
        "context": result["context"],
        "sources": result["sources"],
        "prompt": prompt
    }
