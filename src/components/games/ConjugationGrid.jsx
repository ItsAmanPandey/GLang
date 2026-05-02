import { useState } from "react";
import GameShell from "./GameShell.jsx";

export default function ConjugationGrid({ gameData, onComplete }) {
  const verbs = gameData.verbs || gameData;
  const [verbIndex, setVerbIndex] = useState(0);
  const [inputs, setInputs] = useState(Array(6).fill(""));
  const [results, setResults] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [totalCells, setTotalCells] = useState(0);
  const [completed, setCompleted] = useState(false);
  const current = verbs[verbIndex];

  function handleInput(i, val) {
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  }

  function check() {
    const checked = current.pronouns.map((_, i) => {
      const answer = current.answers[i];
      const userVal = inputs[i].trim().toLowerCase();
      const correct = Array.isArray(answer)
        ? answer.some(a => a.toLowerCase() === userVal)
        : answer.toLowerCase() === userVal;
      return correct;
    });
    const correct = checked.filter(Boolean).length;
    setResults(checked);
    setTotalScore(s => s + correct);
    setTotalCells(s => s + 6);
  }

  function next() {
    if (verbIndex + 1 >= verbs.length) {
      setCompleted(true);
      onComplete?.(totalScore, totalCells);
    } else {
      setVerbIndex(i => i + 1);
      setInputs(Array(6).fill(""));
      setResults(null);
    }
  }

  function reset() {
    setVerbIndex(0); setInputs(Array(6).fill("")); setResults(null);
    setTotalScore(0); setTotalCells(0); setCompleted(false);
  }

  return (
    <GameShell title="Conjugation Grid" score={totalScore} total={totalCells || verbs.length * 6} completed={completed} onPlayAgain={reset} accent="purple">
      {current && (
        <div className="space-y-4">
          <p className="text-sm text-ink/60 font-semibold">Verb {verbIndex + 1}/{verbs.length}</p>
          <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{current.verb}</h4>
          <div className="space-y-2">
            {current.pronouns.map((pronoun, i) => (
              <div key={pronoun} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-1">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-16 sm:w-24 text-right font-semibold text-xs sm:text-sm shrink-0">{pronoun}</span>
                  <input
                    value={inputs[i]}
                    onChange={(e) => handleInput(i, e.target.value)}
                    disabled={!!results}
                    onKeyDown={(e) => {
                      if (e.key === "Tab" && !e.shiftKey && i < 5) { e.preventDefault(); document.getElementById(`cg-input-${i+1}`)?.focus(); }
                      if (e.key === "Enter" && !results) check();
                    }}
                    id={`cg-input-${i}`}
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      results === null ? "border-ink/15 bg-[var(--surface-color)]" :
                      results[i] ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" :
                      "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
                    }`}
                    placeholder="..."
                  />
                </div>
                {results && !results[i] && (
                  <span className="text-[10px] sm:text-xs text-rose-500 font-bold sm:min-w-[100px] pl-20 sm:pl-0 animate-fade-in">
                    {Array.isArray(current.answers[i]) ? current.answers[i][0] : current.answers[i]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            {!results ? (
              <button type="button" onClick={check} className="bg-purple-600 text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors">Check</button>
            ) : (
              <button type="button" onClick={next} className="bg-purple-600 text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-purple-700">{verbIndex + 1 >= verbs.length ? "Finish" : "Next Verb"}</button>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
