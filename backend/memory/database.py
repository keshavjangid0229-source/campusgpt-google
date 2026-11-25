
import sqlite3

from pathlib import Path
from contextlib import contextmanager


BASE_DIR = Path(__file__).resolve().parent.parent

DB_PATH = BASE_DIR / "database" / "memory.db"

DB_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)


@contextmanager
def get_connection():

    connection = sqlite3.connect(
        str(DB_PATH),
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    try:

        yield connection

        connection.commit()

    except Exception:

        connection.rollback()

        raise

    finally:

        connection.close()


def initialize_database():

    with get_connection() as connection:

        connection.execute("""
            CREATE TABLE IF NOT EXISTS messages (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                conversation_id TEXT NOT NULL,

                role TEXT NOT NULL
                    CHECK(role IN ('user', 'assistant')),

                content TEXT NOT NULL,

                created_at DATETIME
                    DEFAULT CURRENT_TIMESTAMP

            )
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS
            idx_conversation_messages

            ON messages (
                conversation_id,
                id
            )
        """)

    print("CampusGPT Memory Database Ready!")


if __name__ == "__main__":

    initialize_database()

    print("Database location:", DB_PATH)
