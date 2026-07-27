"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/chat/CodeBlock";

interface MarkdownMessageProps {
  text: string;
  tone: "user" | "assistant";
}

/** Renders assistant replies as real markdown (lists, bold, links, tables,
 *  fenced code) instead of a raw text blob — Gemini's replies are markdown
 *  already, so previously all that formatting was just showing up as
 *  literal asterisks and backticks. */
export default function MarkdownMessage({ text, tone }: MarkdownMessageProps) {
  const linkColor = tone === "user" ? "#0a0a0b" : "var(--noir-accent)";

  return (
    <div className="text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1.5">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:opacity-80"
              style={{ color: linkColor }}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          h1: ({ children }) => <h1 className="mt-2 mb-1 text-base font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-2 mb-1 text-sm font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-2 mb-1 text-sm font-bold">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote
              className="my-1.5 border-l-2 pl-3 italic opacity-90"
              style={{ borderColor: tone === "user" ? "#0a0a0b55" : "var(--noir-accent)" }}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--noir-border)" }}>
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-2 py-1 text-left font-semibold border-b" style={{ borderColor: "var(--noir-border)" }}>{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 border-b" style={{ borderColor: "var(--noir-border)" }}>{children}</td>,
          code(props) {
            const { className, children } = props as { className?: string; children?: React.ReactNode };
            const match = /language-(\w+)/.exec(className || "");
            const codeText = String(children ?? "").replace(/\n$/, "");

            if (match) {
              return <CodeBlock language={match[1]} code={codeText} />;
            }

            return (
              <code
                className="rounded px-1.5 py-0.5 font-mono text-[0.85em]"
                style={{
                  background: tone === "user" ? "rgba(0,0,0,0.15)" : "var(--noir-bg-surface-3)",
                  color: tone === "user" ? "#0a0a0b" : "var(--noir-accent)",
                }}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
