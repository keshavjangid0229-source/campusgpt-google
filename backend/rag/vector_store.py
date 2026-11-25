
from pathlib import Path
from functools import lru_cache

import chromadb

from rag.embeddings import generate_embeddings


BASE_DIR = Path(__file__).resolve().parents[1]

DB_PATH = BASE_DIR / "database" / "chroma"

DB_PATH.mkdir(parents=True, exist_ok=True)


@lru_cache(maxsize=1)
def get_collection():

    client = chromadb.PersistentClient(
        path=str(DB_PATH)
    )

    return client.get_or_create_collection(
        name="campusgpt_documents",
        metadata={"hnsw:space": "cosine"},
        embedding_function=None
    )


def store_chunks(chunks):

    if not chunks:
        return 0

    collection = get_collection()

    batch_size = 32

    for start in range(0, len(chunks), batch_size):

        batch = chunks[start:start + batch_size]

        texts = [
            chunk["text"]
            for chunk in batch
        ]

        embeddings = generate_embeddings(texts)

        collection.upsert(
            ids=[
                chunk["id"]
                for chunk in batch
            ],
            documents=texts,
            embeddings=embeddings,
            metadatas=[
                {
                    "document_id": chunk["document_id"],
                    "filename": chunk["filename"],
                    "page": chunk["page"]
                }
                for chunk in batch
            ]
        )

    return len(chunks)


def database_count():
    return get_collection().count()
