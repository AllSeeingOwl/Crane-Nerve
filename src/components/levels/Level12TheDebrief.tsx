import React, { useEffect, useRef, useState } from "react";

// DVORAK mapping dictionary for QWERTY standard layout (lowercase only for simplicity)
const qwertyToDvorak: Record<string, string> = {
  q: "'",
  w: ",",
  e: ".",
  r: "p",
  t: "y",
  y: "f",
  u: "g",
  i: "c",
  o: "r",
  p: "l",
  a: "a",
  s: "o",
  d: "e",
  f: "u",
  g: "i",
  h: "d",
  j: "h",
  k: "t",
  l: "n",
  ";": "s",
  z: ";",
  x: "q",
  c: "j",
  v: "k",
  b: "x",
  n: "b",
  m: "m",
  ",": "w",
  ".": "v",
  "/": "z",
  "-": "[",
  "=": "]",
  "'": "-",
  "[": "/",
  "]": "=",

  // Uppercase map (using shift on QWERTY)
  Q: '"',
  W: "<",
  E: ">",
  R: "P",
  T: "Y",
  Y: "F",
  U: "G",
  I: "C",
  O: "R",
  P: "L",
  A: "A",
  S: "O",
  D: "E",
  F: "U",
  G: "I",
  H: "D",
  J: "H",
  K: "T",
  L: "N",
  ":": "S",
  Z: ":",
  X: "Q",
  C: "J",
  V: "K",
  B: "X",
  N: "B",
  M: "M",
  "<": "W",
  ">": "V",
  "?": "Z",
  _: "{",
  "+": "}",
  '"': "_",
  "{": "?",
  "}": "+",

  // Spaces are the same
  " ": " ",
};

// Target text (~250 words, lots of hard medical/conflated words)
const targetText = `Dear Patient,

I am writing this correspondence to proffer my sincerest apologies regarding the anomalous and unequivocally suboptimal series of events that transpired during your neurological assessment. It was profoundly regrettable that the diagnostic protocols dissolved into chaotic pandemonium. The concatenation of involuntary musculoskeletal twitches, exacerbated by the unsolicited exacerbation of your gag reflex, was genuinely unforeseeable. Furthermore, the inadvertent application of excessive kinetic force to your ocular globes and the ensuing vasovagal syncope you experienced were deleterious to our therapeutic alliance.

My pedagogical training in otolaryngology and neuro-ophthalmology typically prevents such flagrant breaches of hippocratic decorum. However, I must confess that a multifaceted confluence of circadian dysrhythmia—brought upon by thirty-six hours of continuous clinical vigilance—and a catastrophic miscalibration of my tuning fork precipitated this iatrogenic catastrophe.

I solemnly assure you that I am undertaking immediate remediation, including the meticulous recalibration of my proprioceptive awareness and a thorough epistemological review of my clinical acumen. The malodorous olfactory stimuli deployed were intended solely to stimulate your first cranial nerve, not to induce gastrointestinal distress. Please accept my contrition for the concomitant psychological trauma. I hope your recovery is expeditious and without lingering sequelae.

Sincerely,
The Doctor`;

export function Level12TheDebrief({
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [backspacesUsed, setBackspacesUsed] = useState(0);
  const maxBackspaces = 25;
  const [showDvorakMessage, setShowDvorakMessage] = useState(false);
  const [startTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);

  // Show the DVORAK message after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDvorakMessage(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (finished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept special commands (like Cmd+R)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      e.preventDefault();

      if (e.key === "Backspace" || e.key === "Delete") {
        if (backspacesUsed < maxBackspaces && typedChars.length > 0) {
          setTypedChars((prev) => prev.slice(0, -1));
          setBackspacesUsed((prev) => prev + 1);
        }
        return;
      }

      if (e.key === "Enter") {
        setTypedChars((prev) => {
          const newChars = [...prev, "\n"];

          // Check if we reached the end
          if (newChars.length >= targetText.length) {
            setFinished(true);
          }
          return newChars;
        });
        return;
      }

      // Handle normal typing
      if (e.key.length === 1) {
        // Normal character (not a modifier key)
        const mappedKey = qwertyToDvorak[e.key] || e.key;

        setTypedChars((prev) => {
          const newChars = [...prev, mappedKey];

          // Check if we reached the end
          if (newChars.length >= targetText.length) {
            setFinished(true);
          }
          return newChars;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [backspacesUsed, typedChars.length, finished]);

  // Finish condition logic
  useEffect(() => {
    if (finished) {
      let correctChars = 0;
      for (let i = 0; i < targetText.length; i++) {
        if (typedChars[i] === targetText[i]) {
          correctChars++;
        }
      }
      const accuracy = correctChars / targetText.length;

      if (accuracy >= 0.9) {
        onWin();
      } else {
        onLose(
          `Apology rejected. Accuracy was ${(accuracy * 100).toFixed(1)}% (Needed 90%). You clearly don't mean it.`,
        );
      }
    }
  }, [finished, typedChars, onWin, onLose]);

  // Render the text with formatting
  return (
    <div className="absolute inset-0 pointer-events-auto bg-slate-900/95 flex flex-col items-center justify-center font-mono p-8">
      {showDvorakMessage && (
        <div className="absolute top-10 text-center animate-bounce z-50">
          <h1 className="text-4xl font-black text-yellow-400 bg-black/80 px-8 py-4 rounded-xl border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]">
            By the way, this is a DVORAK keyboard.
          </h1>
        </div>
      )}

      <div className="w-full max-w-4xl bg-slate-800 p-8 rounded-xl border-2 border-slate-700 shadow-2xl relative overflow-hidden h-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-slate-600 pb-4">
          <h2 className="text-2xl text-blue-400 font-bold">THE DEBRIEF</h2>
          <div className="text-right">
            <p className="text-slate-400">
              Backspaces:{" "}
              <span
                className={
                  backspacesUsed >= maxBackspaces
                    ? "text-red-500 font-bold"
                    : "text-white"
                }
              >
                {backspacesUsed} / {maxBackspaces}
              </span>
            </p>
            <p className="text-slate-400">
              Progress:{" "}
              <span className="text-white">
                {typedChars.length} / {targetText.length}
              </span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-lg leading-relaxed relative">
          {/* Target text (background) */}
          <div className="absolute inset-0 text-slate-600 pointer-events-none select-none">
            {targetText}
          </div>

          {/* Typed text (foreground) */}
          <div
            className="relative z-10 break-all"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {targetText.split("").map((char, index) => {
              if (index >= typedChars.length) return null; // Not typed yet

              const typed = typedChars[index];
              const isCorrect = typed === char;

              if (char === "\n") {
                // Line breaks need special handling so they actually break lines
                return (
                  <span
                    key={index}
                    className={isCorrect ? "" : "bg-red-500/50"}
                  >
                    <br />
                  </span>
                );
              }

              return (
                <span
                  key={index}
                  className={
                    isCorrect
                      ? "text-green-400"
                      : "bg-red-500/50 text-white font-bold"
                  }
                >
                  {typed}
                </span>
              );
            })}
            {/* Cursor */}
            {!finished && (
              <span className="inline-block w-2.5 h-6 bg-white animate-pulse align-middle ml-0.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
