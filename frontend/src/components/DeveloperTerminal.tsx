"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, CornerDownLeft } from "lucide-react";
import { useLocale } from "@/lib/localeContext";

interface CommandLog {
  input: string;
  output: React.ReactNode;
}

export default function DeveloperTerminal() {
  const { t } = useLocale();
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      input: "",
      output: (
        <div className="text-slate-400 font-mono text-xs leading-relaxed">
          Welcome to Jaimin's Interactive Console compiler.
          <br />
          Type <span className="text-cyan-400 font-bold">help</span> to check available tasks.
        </div>
      ),
    },
  ]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, () => React.ReactNode> = {
    help: () => (
      <div className="space-y-1 font-mono text-xs text-slate-350">
        <div>Available commands:</div>
        <div>
          • <span className="text-cyan-400 font-bold">skills</span> : Show engineering focus areas
        </div>
        <div>
          • <span className="text-cyan-400 font-bold">projects</span> : Show highlighted projects
        </div>
        <div>
          • <span className="text-cyan-400 font-bold">contact</span> : Get direct connection endpoints
        </div>
        <div>
          • <span className="text-cyan-400 font-bold">clear</span> : Reset screen logging
        </div>
        <div>
          • <span className="text-cyan-400 font-bold">easter-egg</span> : Compile secret message
        </div>
      </div>
    ),
    skills: () => (
      <div className="space-y-1 font-mono text-xs text-slate-300">
        <div><span className="text-purple-400 font-semibold">• Backend:</span> Java, Spring Boot, REST APIs, Microservices</div>
        <div><span className="text-cyan-400 font-semibold">• Frontend:</span> React, Next.js, Tailwind, TypeScript</div>
        <div><span className="text-pink-400 font-semibold">• Databases:</span> PostgreSQL, MySQL, Redis</div>
        <div><span className="text-emerald-400 font-semibold">• AI & Cloud:</span> LLM integration, Docker, AWS, Prompt Engineering</div>
      </div>
    ),
    projects: () => (
      <div className="space-y-1 font-mono text-xs text-slate-300">
        <div>• <span className="text-cyan-400 font-semibold">AI Job Matcher:</span> Automated resume review system</div>
        <div>• ... and others featured below in the projects section!</div>
      </div>
    ),
    contact: () => (
      <div className="space-y-1 font-mono text-xs text-slate-300">
        <div>• <span className="text-cyan-400">Email:</span> jaiminpanchal939@gmail.com</div>
        <div>• <span className="text-cyan-400">LinkedIn:</span> linkedin.com/in/jaimin-panchal-65865819a</div>
        <div>• <span className="text-cyan-400">GitHub:</span> github.com/jaiminpanchal2002</div>
      </div>
    ),
    "easter-egg": () => (
      <div className="text-emerald-400 font-mono text-xs font-bold animate-pulse">
        🎉 ACHIEVEMENT UNLOCKED: "The Terminal Wizard"! You successfully executed a secret code path.
      </div>
    ),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();

    if (!cmd) return;

    if (cmd === "clear") {
      setLogs([]);
      setInput("");
      return;
    }

    const resolver = commands[cmd];
    const output = resolver ? (
      resolver()
    ) : (
      <span className="text-rose-500 font-mono text-xs">
        Command not found: '{cmd}'. Type 'help' for options.
      </span>
    );

    setLogs((prev) => [...prev, { input, output }]);
    setInput("");
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full bento-card p-6 shadow-2xl flex flex-col justify-between h-[300px] bg-black/60 border border-white/5">
      {/* Terminal Titlebar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 text-xxs font-bold uppercase tracking-wider text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-cyan-455">
          <Terminal size={14} /> terminal.log
        </span>
        <span className="text-white/20 select-none">v1.0.0</span>
      </div>

      {/* Output Console Log */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/5">
        {logs.map((log, idx) => (
          <div key={idx} className="space-y-1">
            {log.input && (
              <div className="font-mono text-xs text-slate-500">
                <span className="text-cyan-400 font-bold">jaimin@portfolio:~$</span> {log.input}
              </div>
            )}
            <div>{log.output}</div>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>

      {/* Command prompt inputs */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/5 pt-3">
        <span className="font-mono text-xs text-cyan-400 font-bold select-none">jaimin@portfolio:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs text-white font-mono focus:outline-none placeholder-slate-600"
          placeholder="help"
          aria-label="Terminal command prompt"
        />
        <button type="submit" className="p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">
          <CornerDownLeft size={12} />
        </button>
      </form>
    </div>
  );
}
