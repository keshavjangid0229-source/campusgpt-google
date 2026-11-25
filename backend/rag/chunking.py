
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)


def create_chunks(pages, document_id, filename):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " ",
            ""
        ]
    )

    chunks = []

    for page in pages:

        texts = splitter.split_text(
            page["text"]
        )

        for index, text in enumerate(texts):

            chunks.append({
                "id": (
                    f"{document_id}-"
                    f"{page['page']}-{index}"
                ),
                "document_id": document_id,
                "filename": filename,
                "page": page["page"],
                "text": text
            })

    return chunks
