import re


MAX_HISTORY_MESSAGES = 20
MAX_SELECTED_MESSAGES = 6
MAX_MESSAGE_LENGTH = 800
DEFAULT_TOKEN_BUDGET = 700


STOP_WORDS = {
    "the", "is", "am", "are", "was",
    "were", "a", "an", "to", "of",
    "in", "on", "for", "and", "or",
    "it", "this", "that", "be",
    "can", "could", "would", "should",
    "please", "tell", "me",
    "hai", "ka", "ki", "ke",
    "ko", "aur", "se", "kya"
}


def tokenize(text):

    words = re.findall(
        r"\w+",
        text.lower()
    )

    return {
        word for word in words
        if word not in STOP_WORDS
    }


def clean_text(text):

    if not isinstance(text, str):
        return ""

    return text.strip()


def normalize_history(history):

    if not history:
        return []

    cleaned = []

    for message in history[-MAX_HISTORY_MESSAGES:]:

        if not isinstance(message, dict):
            continue

        role = message.get("role")

        if role not in ("user", "assistant"):
            continue

        content = clean_text(
            message.get("content", "")
        )

        if not content:
            continue

        cleaned.append({
            "role": role,
            "content": content[:MAX_MESSAGE_LENGTH]
        })

    return cleaned


def calculate_relevance(question, content):

    question_words = tokenize(question)

    content_words = tokenize(content)

    if not question_words or not content_words:
        return 0.0

    common_words = (
        question_words.intersection(content_words)
    )

    score = (
        len(common_words)
        / len(question_words)
    )

    return score


def select_relevant_history(
    question,
    history,
    max_messages=MAX_SELECTED_MESSAGES
):

    history = normalize_history(history)

    if not history:
        return []

    max_messages = max(
        1,
        min(max_messages, MAX_HISTORY_MESSAGES)
    )

    total = len(history)

    ranked = []

    for index, message in enumerate(history):

        relevance = calculate_relevance(
            question,
            message["content"]
        )

        recency = (index + 1) / total

        role_bonus = (
            0.15
            if message["role"] == "user"
            else 0.0
        )

        score = (
            relevance * 0.65
            + recency * 0.35
            + role_bonus
        )

        ranked.append({
            "index": index,
            "score": score,
            "message": message
        })

    ranked.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # Preserve the most recent exchange.

    selected_indices = set(
        range(
            max(0, total - min(2, max_messages)),
            total
        )
    )

    for item in ranked:

        if len(selected_indices) >= max_messages:
            break

        selected_indices.add(item["index"])

    selected = []
    seen = set()

    for index in sorted(selected_indices):

        message = history[index]

        key = (
            message["role"],
            " ".join(
                message["content"].lower().split()
            )
        )

        if key in seen:
            continue

        seen.add(key)

        selected.append(message)

    return selected


def count_tokens(text, tokenizer):

    return len(
        tokenizer.encode(
            text,
            add_special_tokens=False
        )
    )


def format_history(history):

    sections = []

    for message in history:

        role = (
            "User"
            if message["role"] == "user"
            else "CampusGPT"
        )

        sections.append(
            f"{role}: {message['content']}"
        )

    return "\n".join(sections)


def fit_token_budget(
    history,
    tokenizer,
    token_budget=DEFAULT_TOKEN_BUDGET
):

    selected = list(history)

    token_budget = max(0, token_budget)

    while selected:

        context = format_history(selected)

        if count_tokens(
            context,
            tokenizer
        ) <= token_budget:

            return selected

        # Remove the oldest selected message.

        selected.pop(0)

    return []


def build_context(
    question,
    history,
    tokenizer,
    token_budget=DEFAULT_TOKEN_BUDGET
):

    normalized = normalize_history(history)

    selected = select_relevant_history(
        question,
        normalized
    )

    selected = fit_token_budget(
        selected,
        tokenizer,
        token_budget
    )

    context = format_history(selected)

    return {
        "context": context,
        "messages": selected,
        "original_messages": len(normalized),
        "selected_messages": len(selected),
        "context_tokens": count_tokens(
            context,
            tokenizer
        ),
        "token_budget": token_budget
    }