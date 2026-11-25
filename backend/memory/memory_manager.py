from memory.database import get_connection


MAX_HISTORY_MESSAGES = 20
MAX_STORED_MESSAGES = 100
MAX_CONTEXT_MESSAGES = 6


def save_message(conversation_id, role, content):

    if not conversation_id:
        raise ValueError("Conversation ID is required.")

    if role not in ("user", "assistant"):
        raise ValueError("Invalid message role.")

    if not isinstance(content, str):
        raise ValueError("Invalid message content.")

    content = content.strip()

    if not content:
        return

    with get_connection() as connection:

        connection.execute(
            """
            INSERT INTO messages
            (conversation_id, role, content)
            VALUES (?, ?, ?)
            """,
            (conversation_id, role, content)
        )

        connection.execute(
            """
            DELETE FROM messages
            WHERE conversation_id = ?
            AND id NOT IN (
                SELECT id FROM messages
                WHERE conversation_id = ?
                ORDER BY id DESC
                LIMIT ?
            )
            """,
            (
                conversation_id,
                conversation_id,
                MAX_STORED_MESSAGES
            )
        )


def get_history(
    conversation_id,
    limit=MAX_HISTORY_MESSAGES
):

    limit = max(
        1,
        min(limit, MAX_HISTORY_MESSAGES)
    )

    with get_connection() as connection:

        rows = connection.execute(
            """
            SELECT role, content
            FROM messages
            WHERE conversation_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (conversation_id, limit)
        ).fetchall()

    return [
        dict(row)
        for row in reversed(rows)
    ]


def clear_history(conversation_id):

    with get_connection() as connection:

        cursor = connection.execute(
            """
            DELETE FROM messages
            WHERE conversation_id = ?
            """,
            (conversation_id,)
        )

        return cursor.rowcount


def count_messages(conversation_id):

    with get_connection() as connection:

        result = connection.execute(
            """
            SELECT COUNT(*) AS total
            FROM messages
            WHERE conversation_id = ?
            """,
            (conversation_id,)
        ).fetchone()

        return result["total"]


def get_memory_stats(conversation_id):

    total = count_messages(
        conversation_id
    )

    return {
        "conversation_id": conversation_id,
        "total_messages": total,
        "memory_available": total > 0,
        "storage": "SQLite",
        "max_stored_messages": MAX_STORED_MESSAGES,
        "max_retrieved_messages": MAX_HISTORY_MESSAGES,
        "max_context_messages": MAX_CONTEXT_MESSAGES
    }