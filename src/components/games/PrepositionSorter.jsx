import { useEffect, useMemo, useState } from "react";
import GameShell from "./GameShell.jsx";
import { shuffle } from "../../utils/practice.js";

const ROUND_SIZE = 10;

export default function PrepositionSorter({ gameData, onComplete }) {
  const pool = useMemo(() => uniqueItems(gameData.items || []), [gameData]);
  const buckets = gameData.buckets || [];
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 600;
  const [items, setItems] = useState(() => shuffle(pool).slice(0, ROUND_SIZE));
  const [placements, setPlacements] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [completed, setCompleted] = useState(false);

  const remaining = items.filter((item) => !placements[item.id]);
  const current = remaining[0];

  useEffect(() => {
    setItems(shuffle(pool).slice(0, ROUND_SIZE));
    setPlacements({});
    setShowResults(false);
    setCompleted(false);
  }, [pool]);

  function placeItem(itemId, bucketId) {
    const nextPlacements = { ...placements, [itemId]: bucketId };
    setPlacements(nextPlacements);
    if (Object.keys(nextPlacements).length >= items.length) {
      setTimeout(() => setShowResults(true), 300);
    }
  }

  function finish() {
    onComplete?.(0, 0);
  }

  function reset() {
    setItems(shuffle(pool).slice(0, ROUND_SIZE));
    setPlacements({});
    setShowResults(false);
    setCompleted(false);
    setDraggedId(null);
  }

  function handleDragStart(e, itemId) {
    e.dataTransfer.setData("text/plain", itemId);
    setDraggedId(itemId);
  }

  function handleDrop(e, bucketId) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) placeItem(id, bucketId);
    setDraggedId(null);
  }

  if (showResults && !completed) {
    const results = items.map((item) => ({
      ...item,
      placed: placements[item.id],
      correct: placements[item.id] === item.correctBucket,
    }));

    return (
      <GameShell title="Sorter" score={0} total={0} completed={false} onPlayAgain={reset} accent="purple">
        <div className="space-y-4">
          <h4 className="font-bold text-lg">Round Results</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {buckets.map((bucket) => (
              <div key={bucket.id} className="min-h-[140px] border border-purple-200 dark:border-purple-900/50 rounded-xl p-2">
                <h5 className="font-bold text-sm mb-2 text-purple-700 dark:text-purple-300">{bucket.label}</h5>
                {results.filter((item) => item.placed === bucket.id).map((item) => (
                  <span
                    key={item.id}
                    className={`inline-block px-3 py-1 m-1 rounded-lg text-sm font-semibold ${
                      item.correct
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 line-through"
                    }`}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white shadow-md hover:bg-purple-700">
              New 10 Words
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Sorter" score={0} total={0} completed={completed} onPlayAgain={reset} accent="purple">
      <div className="space-y-6">
        <p className="text-sm text-ink/60 font-semibold">{Object.keys(placements).length}/{items.length} sorted</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {buckets.map((bucket) => (
            <div
              key={bucket.id}
              onDrop={(e) => handleDrop(e, bucket.id)}
              onDragOver={(e) => e.preventDefault()}
              className="min-h-[140px] border-2 border-dashed border-purple-200 dark:border-purple-900/50 rounded-xl p-3 flex flex-col items-center justify-start gap-2"
            >
              <span className="font-bold text-lg text-purple-700 dark:text-purple-300">{bucket.label}</span>
              {items.filter((item) => placements[item.id] === bucket.id).map((item) => (
                <span key={item.id} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-sm font-semibold rounded-lg">
                  {item.word}
                </span>
              ))}
              {!isDesktop && current && (
                <button
                  type="button"
                  onClick={() => placeItem(current.id, bucket.id)}
                  className="mt-2 w-full py-2 border border-purple-200 rounded-lg font-semibold text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Place here
                </button>
              )}
            </div>
          ))}
        </div>
        {current && (
          <div className="text-center">
            <div
              draggable={isDesktop}
              onDragStart={(e) => handleDragStart(e, current.id)}
              onDragEnd={() => setDraggedId(null)}
              className={`inline-block min-w-[180px] rounded-xl border-2 border-purple-200 bg-[var(--surface-color)] px-6 py-4 text-xl font-bold shadow-md
                ${isDesktop ? "cursor-grab active:cursor-grabbing" : ""} ${draggedId === current.id ? "opacity-50" : ""}`}
            >
              {current.word}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.word}-${item.correctBucket}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
