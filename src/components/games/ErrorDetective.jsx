import { useMemo, useState } from "react";
import GameShell from "./GameShell.jsx";
import { shuffle } from "../../utils/practice.js";

export default function ErrorDetective({ gameData, onComplete }) {
  const items = useMemo(() => shuffle(gameData.items || gameData), [gameData]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const current = items[index];

  function handleTap(wordIndex) {
    if (feedback) return;
    const correct = wordIndex === current.errorIndex;
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, tappedIndex: wordIndex });
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= items.length) {
        setCompleted(true);
        onComplete?.(score + (correct ? 1 : 0), items.length);
      } else {
        setIndex(i => i + 1);
      }
    }, 2000);
  }

  function reset() {
    setIndex(0); setScore(0); setFeedback(null); setCompleted(false);
  }

  const words = current?.sentence.split(" ") || [];

  return (
    <GameShell title="Error Detective" score={score} total={items.length} completed={completed} onPlayAgain={reset} accent="purple">
      {current && (
        <div className="space-y-6">
          <p className="text-sm text-ink/60 font-semibold">{index + 1}/{items.length} - Tap the word with the grammar error</p>
          <div className="flex flex-wrap gap-2 justify-center py-4">
            {words.map((word, wi) => {
              let cls = "px-4 py-3 text-lg font-semibold rounded-xl border-2 transition-all cursor-pointer ";
              if (feedback) {
                if (wi === current.errorIndex) cls += "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ";
                else if (wi === feedback.tappedIndex && !feedback.correct) cls += "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ";
                else cls += "border-ink/10 bg-[var(--surface-color)] opacity-60 ";
              } else {
                cls += "border-ink/10 bg-[var(--surface-color)] hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 ";
              }
              return (
                <button key={wi} type="button" onClick={() => handleTap(wi)} disabled={!!feedback} className={cls}>
                  {word}
                </button>
              );
            })}
          </div>
          {feedback && (
            <div className={`p-4 rounded-xl ${feedback.correct ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <p className={`font-bold ${feedback.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {feedback.correct ? "Correct!" : `The error was: "${current.errorWord}" -> "${current.correctWord}"`}
              </p>
              <p className="text-sm text-ink/60 mt-1">{current.explanation}</p>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
