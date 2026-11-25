import hashlib
import re


def document_terms(text):
    return re.findall(r"[^\W_]+", text.casefold())


def generate_embeddings(texts):
    # Keep the existing Chroma collection's dimensions for PDF uploads.
    # Retrieval ranks the stored text so old MiniLM uploads remain searchable.
    vectors = []
    for text in texts:
        vector = [0.0] * 384
        for term in document_terms(text):
            digest = hashlib.blake2b(term.encode("utf-8"), digest_size=4).digest()
            index = int.from_bytes(digest, "big") % len(vector)
            vector[index] += 1.0
        if not any(vector):
            vector[0] = 1.0
        vectors.append(vector)
    return vectors
