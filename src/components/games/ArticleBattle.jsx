import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameShell from "./GameShell.jsx";
import { shuffle } from "../../utils/practice.js";

const ROUND_SIZE = 10;

export default function ArticleBattle({ gameData, onComplete }) {
  const itemPool = useMemo(() => uniqueItems(gameData.items || gameData), [gameData]);
  const mode = gameData.mode || "nominativ";
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState(() => shuffle(itemPool).slice(0, ROUND_SIZE));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [timerWidth, setTimerWidth] = useState(100);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const buttons = mode === "dativ"
    ? [
        { label: "dem", value: "dem", color: "bg-purple-600" },
        { label: "der", value: "der", color: "bg-fuchsia-600" },
        { label: "den + -n", value: "den", color: "bg-indigo-600" },
      ]
    : mode === "akkusativ"
    ? [
        { label: "den", value: "den", color: "bg-purple-600" },
        { label: "die", value: "die", color: "bg-fuchsia-600" },
        { label: "das", value: "das", color: "bg-indigo-600" },
      ]
    : [
        { label: "der", value: "der", color: "bg-purple-600" },
        { label: "die", value: "die", color: "bg-fuchsia-600" },
        { label: "das", value: "das", color: "bg-indigo-600" },
      ];

  const current = items[index];

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimerWidth(100);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / 5000) * 100);
      setTimerWidth(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleAnswer(null);
      }
    }, 50);
  }, [index]);

  useEffect(() => {
    if (started && !completed && current) startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, completed, started, current, startTimer]);

  useEffect(() => {
    setItems(shuffle(itemPool).slice(0, ROUND_SIZE));
    setIndex(0);
  }, [itemPool]);

  function handleAnswer(chosen) {
    if (feedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = chosen === current?.article;
    const elapsed = Date.now() - startTimeRef.current;
    const bonus = correct && elapsed < 5000 ? Math.max(0, Math.round((5000 - elapsed) / 1000)) : 0;
    const nextScore = score + (correct ? 1 + bonus : 0);
    const nextCorrect = correctCount + (correct ? 1 : 0);

    if (correct) {
      setScore(nextScore);
      setCorrectCount(nextCorrect);
      setStreak((value) => value + 1);
      setTimeBonus(bonus);
    } else {
      setStreak(0);
      setTimeBonus(0);
    }
    setFeedback({ correct, correctAnswer: current?.article });

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= items.length) {
        setCompleted(true);
        onComplete?.(nextCorrect, items.length);
      } else {
        setIndex((value) => value + 1);
      }
    }, correct ? 700 : 1400);
  }

  function startRound() {
    setItems(shuffle(itemPool).slice(0, ROUND_SIZE));
    setStarted(true);
    setCompleted(false);
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setTimeBonus(0);
    setFeedback(null);
  }

  function reset() {
    setStarted(false);
    setCompleted(false);
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setTimeBonus(0);
    setFeedback(null);
  }

  if (!started) {
    return (
      <GameShell title="Article Battle" score={0} total={0} completed={false} onPlayAgain={reset} accent="purple">
        <div className="flex min-h-[330px] flex-col justify-center space-y-5 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">Rules</p>
          <h4 className="text-2xl font-bold">Pick the correct article before time runs out.</h4>
          <p className="mx-auto max-w-md text-ink/65">
            You get 5 seconds per word. Correct answers score 1 point, and faster answers earn bonus points.
          </p>
          <button
            type="button"
            onClick={startRound}
            className="mx-auto rounded-xl bg-purple-600 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-purple-700"
          >
            Start
          </button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Article Battle" score={correctCount} total={items.length} completed={completed} onPlayAgain={reset} accent="purple">
      <div className="absolute top-4 right-20 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full shadow-sm">
        {score} PTS
      </div>
      {current && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-ink/60">{index + 1}/{items.length}</span>
            <span className="text-purple-600 dark:text-purple-400">{streak} streak</span>
          </div>
          <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full transition-all duration-100" style={{ width: `${timerWidth}%` }} />
          </div>
          <p className="py-8 text-4xl font-bold sm:text-5xl">{current.noun}</p>
          {feedback && (
            <p className={`min-h-7 text-lg font-bold ${feedback.correct ? "text-emerald-500" : "text-rose-500"}`}>
              {feedback.correct ? `Correct ${timeBonus > 0 ? `+${timeBonus} bonus` : ""}` : `Answer: ${feedback.correctAnswer}`}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {buttons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                disabled={!!feedback}
                onClick={() => handleAnswer(btn.value)}
                className={`${btn.color} min-w-[104px] rounded-xl px-6 py-4 text-xl font-bold text-white shadow-md transition-all
                  ${feedback?.correctAnswer === btn.value ? "ring-4 ring-emerald-400 scale-105" : ""}
                  ${feedback && feedback.correctAnswer !== btn.value ? "opacity-50" : "hover:scale-105"}
                  disabled:cursor-not-allowed`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.noun}-${item.article}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
