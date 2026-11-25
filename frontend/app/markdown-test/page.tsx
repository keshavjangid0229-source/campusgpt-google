import ChatMessage from "../../components/ChatMessage";
import TypingIndicator from "../../components/TypingIndicator";

const sample = [
  "# Engineering Mathematics",
  "",
  "## Quadratic Equation",
  "",
  "The standard equation is:",
  "",
  String.raw`$$ax^2+bx+c=0$$`,
  "",
  "The quadratic formula is:",
  "",
  String.raw`$$x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$$`,
  "",
  "### Important topics",
  "",
  "- Integration",
  "- Differentiation",
  "- Complex numbers",
  "",
  "### Subject overview",
  "",
  "| Subject | Unit |",
  "|---|---|",
  "| Mathematics | Unit 1 |",
  "| Electronics | Unit 2 |",
  "| Mechanics | Unit 3 |",
  "",
  "### Python example",
  "",
  "```python",
  "import math",
  "",
  "a, b, c = 1, -5, 6",
  "",
  "d = math.sqrt(b**2 - 4*a*c)",
  "",
  "print((-b+d)/(2*a))",
  "print((-b-d)/(2*a))",
  "```",
  "",
  "**Output:** 3.0 and 2.0",
  "",
  "> Always verify your calculations.",
].join("\n");

export default function MarkdownTestPage() {
  return (
    <main className="min-h-dvh bg-[#060d0b] px-5 py-10 text-white">

      <div className="mx-auto max-w-[850px] space-y-10">

        <ChatMessage
          role="user"
          content="Explain quadratic equations with Python."
        />

        <ChatMessage
          role="assistant"
          content={sample}
        />

        <TypingIndicator />

      </div>

    </main>
  );
}