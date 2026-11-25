from collections import Counter
from heapq import nsmallest
from math import log, sqrt

from rag.embeddings import document_terms
from rag.vector_store import get_collection


def search_documents(question, top_k=5, document_id=None):
    options = {"where": {"document_id": document_id}} if document_id else {}
    results = get_collection().get(include=["documents", "metadatas"], **options)
    query = set(document_terms(question))
    frequencies = []
    document_frequency = Counter()
    for text in results["documents"]:
        terms = Counter(document_terms(text))
        matching = query.intersection(terms)
        document_frequency.update(matching)
        frequencies.append((len(terms), {term: terms[term] for term in matching}))

    def rank(index):
        size, matching = frequencies[index]
        score = sum(
            (1 + log(count)) * (1 + log((len(frequencies) + 1) / (document_frequency[term] + 1)))
            for term, count in matching.items()
        ) / sqrt(max(1, size))
        return 1 / (1 + score), results["metadatas"][index]["page"]

    output = []
    for index in nsmallest(top_k, range(len(frequencies)), key=rank):
        metadata = results["metadatas"][index]
        output.append({
            "text": results["documents"][index],
            "filename": metadata["filename"],
            "page": metadata["page"],
            "document_id": metadata["document_id"],
            "distance": round(rank(index)[0], 4),
        })
    return output
