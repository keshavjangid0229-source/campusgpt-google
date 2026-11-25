from services.llm import generate_answer


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
        "content": "Newton described three laws of motion."
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


answer = generate_answer(
    question=question,
    history=history,
    personality="default"
)


print("\nQUESTION:")
print(question)

print("\nCAMPUSGPT RESPONSE:")
print(answer)

if "javascript" in answer.lower():

    print("\nMemory Recall Test: PASS (keyword check)")

else:

    print("\nMemory Recall Test: FAILED")