
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from rag.document_ai import (
    summarize_document,
    ask_document,
    write_notes_section
)

router = APIRouter(prefix="/document")


class SummaryRequest(BaseModel):

    document_id: str


class NotesRequest(BaseModel):
    document_id: str
    section: int = Field(ge=0)


@router.post("/notes")
async def notes(request: NotesRequest):
    try:
        return await run_in_threadpool(
            write_notes_section,
            request.document_id,
            request.section,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


class QuestionRequest(BaseModel):

    document_id: str

    question: str = Field(
        min_length=1,
        max_length=2000
    )


@router.post("/summary")
async def summary(request: SummaryRequest):

    try:

        result = await run_in_threadpool(
            summarize_document,
            request.document_id
        )

        return {
            "status": "success",
            **result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:

        print("Summary error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Summary generation failed."
        )


@router.post("/ask")
async def ask(request: QuestionRequest):

    try:

        result = await run_in_threadpool(
            ask_document,
            request.document_id,
            request.question
        )

        return {
            "status": "success",
            **result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:

        print("Document error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Document question failed."
        )
