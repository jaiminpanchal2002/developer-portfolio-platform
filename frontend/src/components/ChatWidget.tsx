"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Copy, Check } from "lucide-react";
import { sendChatMessage, ChatMessage } from "@/services/chatService";

// Markdown + syntax highlighting are only needed once a reply exists, so
// they're kept out of the homepage's initial bundle entirely.
const MarkdownMessage = dynamic(() => import("@/components/chat/MarkdownMessage"), {
  ssr: false,
  loading: () => null,
});

const easeOut = [0.16, 1, 0.3, 1] as const;

const GREETING: ChatMessage = {
  role: "assistant",
  text: "Hi, I'm Jaimin's portfolio assistant. Ask me about his projects, skills, or experience — I'll answer from his actual profile.",
};

const SUGGESTIONS = [
  "What are his strongest skills?",
  "Tell me about his AI projects",
  "Is he open to remote roles?",
];

/** No real token streaming from the backend — this simulates one by
 *  revealing the finished reply progressively, so it still *feels* alive
 *  rather than popping in as a wall of text. Skipped under reduced-motion. */
function useTypewriter(fullText: string, active: boolean, reduceMotion: boolean) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!active || reduceMotion) return;
    let i = 0;
    const CHUNK = 3;
    const interval = setInterval(() => {
      i += CHUNK;
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [fullText, active, reduceMotion]);

  if (!active || reduceMotion) return fullText;
  return shown;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--noir-accent)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  isLatestAssistant,
  reduceMotion,
}: {
  message: ChatMessage;
  isLatestAssistant: boolean;
  reduceMotion: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const revealed = useTypewriter(message.text, isLatestAssistant, reduceMotion);
  const displayText = isLatestAssistant ? revealed : message.text;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const isUser = message.role === "user";

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className={`group flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className="relative max-w-[88%] rounded-2xl px-4 py-2.5"
        style={
          isUser
            ? { background: "var(--noir-accent)", color: "#0a0a0b" }
            : {
                background: "var(--noir-bg-surface-2)",
                color: "var(--noir-fg)",
                border: "1px solid var(--noir-border)",
              }
        }
      >
        <MarkdownMessage text={displayText || (isUser ? message.text : "")} tone={isUser ? "user" : "assistant"} />

        {!isUser && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy message"
            className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100 cursor-pointer"
            style={{ background: "var(--noir-bg-surface-3)", border: "1px solid var(--noir-border)", color: "var(--noir-fg-muted)" }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { reply } = await sendChatMessage(text, nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong reaching the assistant — please try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastAssistantIndex = [...messages].map((m) => m.role).lastIndexOf("assistant");

  return (
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => {
          setHasOpenedOnce(true);
          setIsOpen((v) => !v);
        }}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl cursor-pointer"
        style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: easeOut }}
      >
        {!hasOpenedOnce && !shouldReduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--noir-accent)" }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Chat with Jaimin's portfolio assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: easeOut }}
            className="fixed bottom-24 right-6 z-40 w-[min(92vw,400px)] h-[min(72vh,600px)] rounded-[26px] p-[1.5px] shadow-2xl"
            style={{ background: "linear-gradient(135deg, var(--noir-accent), var(--noir-border) 40%, var(--noir-accent) 100%)" }}
          >
            <div
              className="flex h-full w-full flex-col overflow-hidden rounded-[24.5px] backdrop-blur-xl"
              style={{ background: "var(--noir-bg-elevated)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--noir-border)" }}>
                <div className="relative w-9 h-9 shrink-0">
                  {!shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "var(--noir-accent)", opacity: 0.35 }}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <div
                    className="relative w-9 h-9 rounded-full flex items-center justify-center border"
                    style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)" }}
                  >
                    <Sparkles size={16} style={{ color: "var(--noir-accent)" }} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--noir-fg)" }}>
                    Portfolio Assistant
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--noir-fg-subtle)" }}>
                    Answers grounded in Jaimin&apos;s real profile
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble
                    key={i}
                    message={m}
                    isLatestAssistant={m.role === "assistant" && i === lastAssistantIndex && i > 0}
                    reduceMotion={shouldReduceMotion}
                  />
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-3 border" style={{ background: "var(--noir-bg-surface-2)", borderColor: "var(--noir-border)" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}

                {messages.length === 1 && !sending && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSend(s)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer hover:border-[var(--noir-accent)] hover:text-[var(--noir-accent)]"
                        style={{ borderColor: "var(--noir-border)", color: "var(--noir-fg-muted)" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="flex items-end gap-2 p-3 border-t shrink-0" style={{ borderColor: "var(--noir-border)" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about his skills, projects, experience…"
                  rows={1}
                  aria-label="Message"
                  className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm max-h-24 border transition-colors focus:outline-none focus:border-[var(--noir-accent)]"
                  style={{ background: "var(--noir-bg-surface-2)", borderColor: "var(--noir-border-strong)", color: "var(--noir-fg)" }}
                />
                <motion.button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                  style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
                >
                  <Send size={17} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
