"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

/** Code blocks inside chat replies get a language label, a copy button, and
 *  syntax highlighting matched to the site's noir palette — a bare <pre>
 *  reads as an unfinished chatbot, not a premium assistant. */
export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border" style={{ borderColor: "var(--noir-border)" }}>
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: "var(--noir-bg-surface-3)", color: "var(--noir-fg-subtle)" }}
      >
        <span>{language || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium normal-case transition-colors cursor-pointer hover:text-[var(--noir-accent)]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, padding: "12px 14px", fontSize: "12.5px", background: "var(--noir-bg)" }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
