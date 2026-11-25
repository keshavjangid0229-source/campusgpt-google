from fastapi import APIRouter, Path, Query
from starlette.concurrency import run_in_threadpool

from memory.memory_manager import (
    get_history,
    clear_history,
    get_memory_stats
)


router = APIRouter(
    prefix="/memory",
    tags=["Conversation Memory"]
)


@router.get("/history/{conversation_id}")
async def history(

    conversation_id: str = Path(
        min_length=1,
        max_length=100,
        pattern=r"^[a-zA-Z0-9_-]+$"
    ),

    limit: int = Query(
        default=20,
        ge=1,
        le=20
    )

):

    messages = await run_in_threadpool(
        get_history,
        conversation_id,
        limit
    )

    return {
        "status": "success",
        "conversation_id": conversation_id,
        "total_returned": len(messages),
        "messages": messages
    }


@router.get("/stats/{conversation_id}")
async def stats(

    conversation_id: str = Path(
        min_length=1,
        max_length=100,
        pattern=r"^[a-zA-Z0-9_-]+$"
    )

):

    result = await run_in_threadpool(
        get_memory_stats,
        conversation_id
    )

    return {
        "status": "success",
        **result
    }


@router.delete("/clear/{conversation_id}")
async def clear(

    conversation_id: str = Path(
        min_length=1,
        max_length=100,
        pattern=r"^[a-zA-Z0-9_-]+$"
    )

):

    deleted = await run_in_threadpool(
        clear_history,
        conversation_id
    )

    return {
        "status": "success",
        "conversation_id": conversation_id,
        "deleted_messages": deleted,
        "message": "Conversation memory cleared."
    }