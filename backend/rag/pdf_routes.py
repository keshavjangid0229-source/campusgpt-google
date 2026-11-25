
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from pathlib import Path
from uuid import uuid4

from rag.pdf_loader import extract_pdf
from rag.chunking import create_chunks
from rag.vector_store import (
    store_chunks,
    database_count,
    get_collection
)
from rag.retriever import search_documents

router = APIRouter(prefix="/pdf")

MAX_SIZE = 10 * 1024 * 1024


class SearchRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2000
    )

    document_id: str | None = None

    top_k: int = Field(
        default=5,
        ge=1,
        le=10
    )


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    document_id = None

    try:
        filename = Path(
            file.filename or "document.pdf"
        ).name

        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        data = await file.read(MAX_SIZE + 1)

        if len(data) > MAX_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Maximum file size is 10 MB."
            )

        if not data.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file."
            )

        document_id = str(uuid4())

        coverage = {}
        pages = await run_in_threadpool(
            extract_pdf,
            data,
            coverage,
        )

        chunks = await run_in_threadpool(
            create_chunks,
            pages,
            document_id,
            filename
        )

        stored = await run_in_threadpool(
            store_chunks,
            chunks
        )

        return {
            "status": "success",
            "message": "PDF indexed successfully",
            "document_id": document_id,
            "filename": filename,
            "pages_with_text": len(pages),
            **coverage,
            "total_chunks": len(chunks),
            "stored_chunks": stored,
            "preview": chunks[0]["text"][:300]
        }

    except HTTPException:
        raise

    except Exception as error:

        if document_id:
            try:
                await run_in_threadpool(
                    get_collection().delete,
                    where={"document_id": document_id}
                )
            except Exception:
                pass

        if isinstance(error, ValueError):
            raise HTTPException(
                status_code=400,
                detail=str(error)
            )

        raise HTTPException(
            status_code=500,
            detail="PDF indexing failed."
        )

    finally:
        await file.close()


@router.post("/search")
async def search_pdf(request: SearchRequest):

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    results = await run_in_threadpool(
        search_documents,
        question,
        request.top_k,
        request.document_id
    )

    return {
        "status": "success",
        "question": question,
        "total_results": len(results),
        "results": results
    }


@router.get("/stats")
async def stats():

    count = await run_in_threadpool(
        database_count
    )

    return {
        "database": "ChromaDB",
        "status": "online",
        "total_chunks": count
    }
