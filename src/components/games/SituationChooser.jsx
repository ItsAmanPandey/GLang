import { useMemo, useState } from "react";
import GameShell from "./GameShell.jsx";
import { shuffle } from "../../utils/practice.js";

export default function SituationChooser({ gameData, onComplete }) {
  const items = useMemo(() => shuffle(gameData.items || gameData), [gameData]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const current = items[index];

  function handleChoice(option) {
    if (feedback) return;
    const correct = option === current.answer;
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, chosen: option });
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= items.length) {
        setCompleted(true);
        onComplete?.(score + (correct ? 1 : 0), items.length);
      } else {
        setIndex(i => i + 1);
      }
    }, 2500);
  }

  function reset() {
    setIndex(0); setScore(0); setFeedback(null); setCompleted(false);
  }

  return (
    <GameShell title="Situation Chooser" score={score} total={items.length} completed={completed} onPlayAgain={reset} accent="purple">
      {current && (
        <div className="space-y-5">
          <p className="text-sm text-ink/60 font-semibold">{index + 1}/{items.length}</p>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
            <p className="text-base leading-relaxed">{current.scenario}</p>
            {current.question && <p className="mt-3 font-bold text-purple-700 dark:text-purple-300">{current.question}</p>}
          </div>
          <div className="grid gap-2">
            {current.options.map((option, i) => {
              let cls = "text-left p-4 rounded-xl border-2 font-medium transition-all ";
              if (feedback) {
                if (option === current.answer) cls += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ";
                else if (option === feedback.chosen) cls += "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 ";
                else cls += "border-ink/10 opacity-50 ";
              } else {
                cls += "border-ink/10 bg-[var(--surface-color)] hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer ";
              }
              return (
                <button key={i} type="button" onClick={() => handleChoice(option)} disabled={!!feedback} className={cls}>
                  {option}
                </button>
              );
            })}
          </div>
          {feedback && (
            <div className={`p-4 rounded-xl ${feedback.correct ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <p className={`font-bold ${feedback.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {feedback.correct ? "Correct!" : `Answer: ${current.answer}`}
              </p>
              <p className="text-sm text-ink/60 mt-1">{current.explanation}</p>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
