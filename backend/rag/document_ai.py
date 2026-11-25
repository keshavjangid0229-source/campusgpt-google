
import re

from rag.vector_store import get_collection
from rag.pipeline import build_rag_context
from services.llm import generate_answer


def get_document_chunks(document_id):

    collection = get_collection()

    result = collection.get(
        where={"document_id": document_id},
        include=["documents", "metadatas"]
    )

    chunks = []

    for chunk_id, text, metadata in zip(
        result["ids"],
        result["documents"],
        result["metadatas"]
    ):
        chunks.append({
            "text": text,
            "page": metadata["page"],
            "filename": metadata["filename"],
            "index": int(chunk_id.rsplit("-", 1)[-1])
        })

    chunks.sort(key=lambda item: (item["page"], item["index"]))

    return chunks


def write_notes_section(document_id, section):
    chunks = get_document_chunks(document_id)
    batch_size = 2
    total_sections = (len(chunks) + batch_size - 1) // batch_size
    if section >= total_sections:
        raise ValueError("PDF notes section not found.")

    start = section * batch_size
    batch = chunks[start:start + batch_size]
    notes = [f"## Section {section + 1}"]
    previous = chunks[start - 1] if start else None
    for chunk in batch:
        content = chunk["text"]
        if previous is None or previous["page"] != chunk["page"] or chunk is batch[0]:
            notes.append(f"\n### PDF page {chunk['page']}")
        if previous and previous["page"] == chunk["page"]:
            # The PDF index stores overlapping chunks. Keep shared text once.
            for overlap in range(min(150, len(content)), 19, -1):
                if previous["text"].endswith(content[:overlap]):
                    content = content[overlap:]
                    break
        for point in re.split(r"\n+|(?<=[.!?])\s+(?=[A-Z])", content):
            point = point.strip()
            if point:
                plain_text = re.sub(r"([\\`*_\[\]<>$])", r"\\\1", point)
                notes.append(f"- {plain_text}")
        previous = chunk
    return {
        "section": section,
        "total_sections": total_sections,
        "notes": "\n".join(notes),
    }


def summarize_document(document_id):

    chunks = get_document_chunks(document_id)

    if not chunks:
        raise ValueError("Document not found.")

    summaries = []
    batch_size = 3

    for start in range(0, len(chunks), batch_size):

        batch = chunks[start:start + batch_size]

        context = "\n\n".join(
            f"Page {chunk['page']}:\n{chunk['text']}"
            for chunk in batch
        )

        summary = generate_answer(
            "Summarize the supplied document section. "
            "Include important concepts and facts. "
            "Preserve relevant page references.",
            context
        )

        summaries.append(summary)

    while len(summaries) > 1:

        combined = []

        for start in range(0, len(summaries), 3):

            batch = summaries[start:start + 3]

            if len(batch) == 1:
                combined.append(batch[0])
                continue

            summary = generate_answer(
                "Combine these summaries into concise "
                "study notes. Preserve important facts.",
                "\n\n".join(batch)
            )

            combined.append(summary)

        summaries = combined

    return {
        "filename": chunks[0]["filename"],
        "pages": len(set(c["page"] for c in chunks)),
        "summary": summaries[0]
    }


def ask_document(document_id, question):

    result = build_rag_context(
        question=question,
        document_id=document_id,
        top_k=4
    )

    if not result["found"]:
        raise ValueError("Document not found.")

    answer = generate_answer(
        question,
        result["context"]
    )

    return {
        "reply": answer,
        "sources": result["sources"]
    }
