from services.context_manager import (
    select_relevant_history,
    calculate_relevance
)


history = [
    {
        "role": "user",
        "content": "My favourite programming language is JavaScript."
    },
    {
        "role": "assistant",
        "content": "JavaScript is useful for web development."
    },
    {
        "role": "user",
        "content": "Explain Newton laws of motion."
    },
    {
        "role": "assistant",
        "content": "Newton explained three laws of motion."
    },
    {
        "role": "user",
        "content": "What is artificial intelligence?"
    },
    {
        "role": "assistant",
        "content": "AI helps computers perform intelligent tasks."
    },
    {
        "role": "user",
        "content": "Explain cloud computing."
    },
    {
        "role": "assistant",
        "content": "Cloud computing provides remote computing resources."
    }
]


question = (
    "What is my favourite programming language?"
)


print("\nUSER QUESTION:")
print(question)


print("\nRELEVANCE SCORES:")

for message in history:

    score = calculate_relevance(
        question,
        message["content"]
    )

    print(
        f"{score:.2f} | "
        f"{message['content']}"
    )


selected = select_relevant_history(
    question,
    history
)


print("\nSELECTED CONTEXT:")

for message in selected:

    print(
        f"{message['role']}: "
        f"{message['content']}"
    )


print("\nOriginal messages:", len(history))

print("Selected messages:", len(selected))


assert any(
    "favourite programming language is JavaScript"
    in message["content"]
    for message in selected
)

assert len(selected) <= 6


print("\nContext Manager Test Passed!")