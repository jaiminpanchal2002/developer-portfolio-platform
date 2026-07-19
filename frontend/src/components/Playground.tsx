"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { useLocale } from "../lib/localeContext";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = [number, number];

const GRID_SIZE = 15;
const INITIAL_SPEED = 155;

const BUGS = [
  { name: "TypeScript Typo", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { name: "Docker Conflict", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { name: "Memory Leak", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { name: "N+1 Query", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { name: "Merge Conflict", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
];

export default function Playground() {
  const { t } = useLocale();
  const [snake, setSnake] = useState<Position[]>([[7, 7]]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [bug, setBug] = useState<Position>([3, 3]);
  const [currentBugType, setCurrentBugType] = useState(BUGS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [floatTexts, setFloatTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>("RIGHT");
  const snakeRef = useRef<Position[]>([[7, 7]]);
  const bugRef = useRef<Position>([3, 3]);
  const currentBugTypeRef = useRef(BUGS[0]);
  const scoreRef = useRef(0);

  const updateSnake = (newSnake: Position[]) => {
    snakeRef.current = newSnake;
    setSnake(newSnake);
  };

  const updateBug = (newBug: Position) => {
    bugRef.current = newBug;
    setBug(newBug);
  };

  const updateBugType = (newType: typeof BUGS[0]) => {
    currentBugTypeRef.current = newType;
    setCurrentBugType(newType);
  };

  const updateScore = (newScore: number) => {
    scoreRef.current = newScore;
    setScore(newScore);
  };

  // Load High Score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dev_game_high");
      if (stored) setHighScore(parseInt(stored, 10));
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      
      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (directionRef.current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (directionRef.current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (directionRef.current !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Keep direction ref in sync
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver]);

  const generateFood = (currentSnake: Position[]): Position => {
    while (true) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const onSnake = currentSnake.some(([sX, sY]) => sX === x && sY === y);
      if (!onSnake) return [x, y];
    }
  };

  const moveSnake = () => {
    const currentSnake = snakeRef.current;
    const currentBug = bugRef.current;
    const currentBugT = currentBugTypeRef.current;
    const currentScore = scoreRef.current;

    const head = currentSnake[0];
    let newHead: Position = [...head];

    switch (directionRef.current) {
      case "UP":
        newHead[1] -= 1;
        break;
      case "DOWN":
        newHead[1] += 1;
        break;
      case "LEFT":
        newHead[0] -= 1;
        break;
      case "RIGHT":
        newHead[0] += 1;
        break;
    }

    // Collision check (walls)
    if (
      newHead[0] < 0 ||
      newHead[0] >= GRID_SIZE ||
      newHead[1] < 0 ||
      newHead[1] >= GRID_SIZE
    ) {
      triggerGameOver();
      return;
    }

    // Collision check (self)
    const selfCollision = currentSnake.some(([x, y]) => x === newHead[0] && y === newHead[1]);
    if (selfCollision) {
      triggerGameOver();
      return;
    }

    const newSnake = [newHead, ...currentSnake];

    // Eat bug check
    if (newHead[0] === currentBug[0] && newHead[1] === currentBug[1]) {
      // Create float animation
      const textId = Date.now();
      const patchedText = `Patched: ${currentBugT.name}! +10 pts`;
      
      setFloatTexts((prev) => [
        ...prev,
        { id: textId, text: patchedText, x: currentBug[0], y: currentBug[1] },
      ]);

      setTimeout(() => {
        setFloatTexts((prev) => prev.filter((t) => t.id !== textId));
      }, 1000);

      // Score calc
      const newScore = currentScore + 10;
      updateScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("dev_game_high", newScore.toString());
      }

      const nextBug = generateFood(currentSnake);
      updateBug(nextBug);
      updateBugType(BUGS[Math.floor(Math.random() * BUGS.length)]);
    } else {
      newSnake.pop();
    }

    updateSnake(newSnake);
  };

  const triggerGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    
    // Read current score from scoreRef to avoid closure capture
    const finalScore = scoreRef.current;
    
    Swal.fire({
      title: "Core Dumped!",
      text: `Game Over. You compiled a score of ${finalScore} points!`,
      icon: "error",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      confirmButtonText: "De-bug Again",
    });
  };

  const handleStartRestart = () => {
    updateSnake([[7, 7]]);
    setDirection("RIGHT");
    updateScore(0);
    setIsGameOver(false);
    updateBug([3, 3]);
    updateBugType(BUGS[0]);
    setIsPlaying(true);
  };

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
          {t("arcade.title", "Interactive Arcade")}
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm font-semibold">
          Need a break from looking at codebase architectures? Patch some compiling issues in real-time inside this retro terminal console!
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: ARCADE CABINET */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-lg bento-card p-4 md:p-6 shadow-2xl relative overflow-hidden">
            {/* Header / Brand */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3 text-cyan-455 font-mono text-xs font-semibold">
              <span className="flex items-center gap-1.5 font-bold tracking-wider">
                <Terminal size={16} /> COMPILER_V1.EXE
              </span>
              <span className="flex items-center gap-1.5">
                <Gamepad2 size={16} /> ARCADE_MODE
              </span>
            </div>

            {/* Game Screen Container */}
            <div className="relative aspect-square w-full bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Scanlines Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none z-20" />

              {/* Float Texts Overlay */}
              <AnimatePresence>
                {floatTexts.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 1, y: f.y * (100 / GRID_SIZE) + "%" }}
                    animate={{ opacity: 0, y: (f.y - 2) * (100 / GRID_SIZE) + "%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute text-cyan-400 font-bold font-mono text-xs z-30 pointer-events-none drop-shadow-[0_2px_4px_rgba(6,182,212,0.5)]"
                    style={{ left: f.x * (100 / GRID_SIZE) + "%" }}
                  >
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Grid Board */}
              <div className="w-full h-full grid grid-cols-15 grid-rows-15 p-1 gap-[1px]">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const isHead = snake[0][0] === x && snake[0][1] === y;
                  const isBody = snake.slice(1).some(([sX, sY]) => sX === x && sY === y);
                  const isFood = bug[0] === x && bug[1] === y;

                  return (
                    <div
                      key={i}
                      className={`relative rounded-[3px] transition duration-75 ${
                        isHead
                          ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                          : isBody
                          ? "bg-cyan-600/60"
                          : isFood
                          ? "bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse"
                          : "bg-slate-950/20 border border-slate-900/40"
                      }`}
                    >
                      {isHead && (
                        <div className="absolute inset-1 bg-white rounded-full animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Game Overlay (Start/Pause/Game Over) */}
              <AnimatePresence>
                {(!isPlaying || isGameOver) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#020617]/90 flex flex-col items-center justify-center gap-4 z-10 p-6 text-center"
                  >
                    <Gamepad2 className="text-cyan-400 animate-bounce" size={48} />
                    <h3 className="text-2xl font-extrabold text-white">
                      {isGameOver ? "CORE DUMPED" : "BUG HUNTER COMPILER"}
                    </h3>
                    <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                      Patch compile bugs by directing your compiler cursor. Grow your score, don't hit borders!
                    </p>

                    <button
                      onClick={handleStartRestart}
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer text-sm"
                    >
                      {isGameOver ? (
                        <>
                          <RotateCcw size={18} /> Re-Compile
                        </>
                      ) : (
                        <>
                          <Play size={18} /> Start Patching
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cabinet Controls (Mobile/Touch Friendly D-Pad) */}
            <div className="mt-6 flex justify-between items-center border-t border-cyan-500/20 pt-4 gap-6">
              {/* Scoring */}
              <div className="font-mono text-left">
                <span className="text-slate-500 text-xs block font-bold uppercase">Patched Bugs</span>
                <span className="text-2xl font-extrabold text-white">{score}</span>
              </div>

              {/* Visual Mobile D-Pad */}
              <div className="grid grid-cols-3 gap-2 w-32 h-32 select-none md:hidden">
                <div></div>
                <button
                  onClick={() => directionRef.current !== "DOWN" && setDirection("UP")}
                  className="p-3 bg-slate-900 border border-slate-800 active:border-cyan-500 text-cyan-400 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <ArrowUp size={20} />
                </button>
                <div></div>

                <button
                  onClick={() => directionRef.current !== "RIGHT" && setDirection("LEFT")}
                  className="p-3 bg-slate-900 border border-slate-800 active:border-cyan-500 text-cyan-400 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-center text-slate-700 text-xs font-bold font-mono">
                  D-PAD
                </div>
                <button
                  onClick={() => directionRef.current !== "LEFT" && setDirection("RIGHT")}
                  className="p-3 bg-slate-900 border border-slate-800 active:border-cyan-500 text-cyan-400 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <ArrowRight size={20} />
                </button>

                <div></div>
                <button
                  onClick={() => directionRef.current !== "UP" && setDirection("DOWN")}
                  className="p-3 bg-slate-900 border border-slate-800 active:border-cyan-500 text-cyan-400 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <ArrowDown size={20} />
                </button>
                <div></div>
              </div>

              {/* Pause Control (Desktop) */}
              <div className="hidden md:flex gap-3">
                {isPlaying && (
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-yellow-500 rounded-xl text-yellow-400 cursor-pointer"
                    title="Pause"
                  >
                    <Pause size={18} />
                  </button>
                )}
                {!isPlaying && !isGameOver && score > 0 && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-green-500 rounded-xl text-green-400 cursor-pointer"
                    title="Resume"
                  >
                    <Play size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ARCADE DETAILS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              Developer High Scores
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="font-bold text-sm text-yellow-400">1st (Arcade Record)</span>
                <span className="font-mono text-white text-sm">340 pts (Jaimin)</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="font-bold text-sm text-slate-300">Your Personal Best</span>
                <span className="font-mono text-white text-sm">{highScore} pts</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
              🕹️ Instructions
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Compile bugs spawn randomly as you play. Control the compiler head to absorb and fix them.
            </p>
            <div className="text-xs font-mono text-slate-350 space-y-2.5">
              <div className="flex justify-between">
                <span>Move Up:</span>
                <span className="bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">ArrowUp</span>
              </div>
              <div className="flex justify-between">
                <span>Move Down:</span>
                <span className="bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">ArrowDown</span>
              </div>
              <div className="flex justify-between">
                <span>Move Left:</span>
                <span className="bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">ArrowLeft</span>
              </div>
              <div className="flex justify-between">
                <span>Move Right:</span>
                <span className="bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">ArrowRight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
