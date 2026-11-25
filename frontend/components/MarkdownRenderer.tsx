"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Copy, Check, Code2 } from "lucide-react";

import "katex/dist/katex.min.css";

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-[#a1efc725] bg-[#0c1510]">

      <div className="flex items-center justify-between border-b border-[#a1efc715] bg-[#14271e] px-4 py-3">

        <div className="flex items-center gap-2 text-xs text-[#a1efc7]">
          <Code2 size={16} />
          {language || "text"}
        </div>

        <button
          onClick={copyCode}
          className="flex items-center gap-2 text-xs text-[#8fa69b] transition hover:text-white"
        >
          {copied ? (
            <Check size={15} />
          ) : (
            <Copy size={15} />
          )}

          {copied ? "Copied" : "Copy code"}
        </button>

      </div>

      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "18px",
          background: "#0c1510",
          fontSize: "13px",
          lineHeight: "1.7",
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>

    </div>
  );
}

export default function MarkdownRenderer({
  content,
}: {
  content: string;
}) {
  return (
    <div className="min-w-0 break-words text-sm leading-7 text-[#dce9e1] [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-3">

      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-2xl font-semibold tracking-tight text-white">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold text-white">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-3 mt-5 text-lg font-medium text-[#a1efc7]">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="my-3 leading-7">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),

          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-2 pl-6 marker:text-[#a1efc7]">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 marker:text-[#a1efc7]">
              {children}
            </ol>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-r-lg border-l-2 border-[#a1efc7] bg-[#10261f]/60 px-4 py-2 text-[#a5b8ae]">
              {children}
            </blockquote>
          ),

          hr: () => (
            <hr className="my-6 border-[#a1efc720]" />
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a1efc7] underline underline-offset-4"
            >
              {children}
            </a>
          ),

          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-[#a1efc725]">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-[#14271e] text-[#a1efc7]">
              {children}
            </thead>
          ),

          th: ({ children }) => (
            <th className="whitespace-nowrap px-4 py-3 font-medium">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-t border-[#a1efc715] px-4 py-3">
              {children}
            </td>
          ),

          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.025]">
              {children}
            </tr>
          ),

          pre: ({ node, children }) => {
            const codeNode = node?.children[0];

            if (
              codeNode &&
              codeNode.type === "element" &&
              codeNode.tagName === "code"
            ) {
              const classes =
                codeNode.properties?.className;

              const language = Array.isArray(classes)
                ? String(classes.join(" ")).match(
                    /language-([\w-]+)/
                  )?.[1] || "text"
                : "text";

              const code = codeNode.children
                .map((child) =>
                  child.type === "text"
                    ? child.value
                    : ""
                )
                .join("")
                .replace(/\n$/, "");

              return (
                <CodeBlock
                  language={language}
                  code={code}
                />
              );
            }

            return (
              <pre className="my-4 overflow-x-auto rounded-xl bg-[#10261f] p-4">
                {children}
              </pre>
            );
          },

          code: ({ children }) => (
            <code className="rounded-md border border-[#a1efc715] bg-[#10261f] px-1.5 py-0.5 text-xs text-[#a1efc7]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

    </div>
  );
}