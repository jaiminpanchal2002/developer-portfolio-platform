"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { sendChatMessage, ChatMessage } from "@/services/chatService";

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

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--noir-fg-subtle)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const shouldReduceMotion = useReducedMotion();
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
        {/* Ambient invite pulse — only before the visitor has ever opened it, and never under reduced-motion */}
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
            transition={{ duration: 0.25, ease: easeOut }}
            className="fixed bottom-24 right-6 z-40 w-[min(92vw,380px)] h-[min(70vh,560px)] flex flex-col rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{ background: "var(--noir-bg-elevated)", borderColor: "var(--noir-border)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--noir-border)" }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center border shrink-0"
                style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)" }}
              >
                <Sparkles size={16} style={{ color: "var(--noir-accent)" }} />
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={
                      m.role === "user"
                        ? { background: "var(--noir-accent)", color: "#0a0a0b" }
                        : { background: "var(--noir-bg-surface-2)", color: "var(--noir-fg)" }
                    }
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3" style={{ background: "var(--noir-bg-surface-2)" }}>
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
                      className="text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer hover:border-[var(--noir-accent)]"
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
                className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm max-h-24 border transition-colors"
                style={{ background: "var(--noir-bg-surface-2)", borderColor: "var(--noir-border-strong)", color: "var(--noir-fg)" }}
              />
              <motion.button
                type="button"
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                aria-label="Send message"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
