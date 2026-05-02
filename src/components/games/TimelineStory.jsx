import { useMemo, useState } from "react";
import GameShell from "./GameShell.jsx";
import { shuffle } from "../../utils/practice.js";

export default function TimelineStory({ gameData, onComplete }) {
  const activeStory = useMemo(() => {
    if (gameData.variants && gameData.variants.length > 0) {
      return gameData.variants[Math.floor(Math.random() * gameData.variants.length)];
    }
    return gameData;
  }, [gameData]);

  const originalEvents = activeStory.events || [];
  const shuffledEvents = useMemo(() => shuffle([...originalEvents]), [activeStory]);
  const [events, setEvents] = useState(shuffledEvents);
  const [results, setResults] = useState(null);
  const [completed, setCompleted] = useState(false);

  function moveEvent(fromIndex, toIndex) {
    if (results) return;
    const next = [...events];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setEvents(next);
  }

  function check() {
    const checked = events.map((event, i) => ({
      ...event,
      correct: event.order === i + 1,
    }));
    const correct = checked.filter((event) => event.correct).length;
    setResults(checked);
  }

  function finish() {
    onComplete?.(0, 0);
  }

  function reset() {
    setEvents(shuffle([...originalEvents]));
    setResults(null);
    setCompleted(false);
  }

  if (results && !completed) {
    const sorted = [...originalEvents].sort((a, b) => a.order - b.order);
    return (
      <GameShell title="Timeline Story" score={0} total={0} completed={false} onPlayAgain={reset} accent="purple">
        <div className="space-y-4">
          <h4 className="font-bold text-lg">{activeStory.storyTitle}</h4>
          <div className="space-y-2">
            {sorted.map((event, i) => {
              const wasCorrect = results.find((result) => result.id === event.id)?.correct;
              return (
                <div key={event.id} className={`p-3 rounded-xl border-2 transition-all ${wasCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-amber-400 bg-amber-50 dark:bg-amber-900/20"}`}>
                  <p className="font-semibold">{i + 1}. {event.de}</p>
                  <p className="text-sm text-ink/60 mt-1">{event.en}</p>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={finish} className="bg-purple-600 text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-purple-700">
            Finish
          </button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Timeline Story" score={0} total={0} completed={completed} onPlayAgain={reset} accent="purple">
      <div className="space-y-4">
        <h4 className="font-bold text-lg">{activeStory.storyTitle}</h4>
        <p className="text-sm text-ink/60">Arrange events in the correct order</p>
        <div className="space-y-2">
          {events.map((event, i) => (
            <div
              key={event.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                moveEvent(from, i);
              }}
              className="p-2 rounded-xl border-2 border-ink/10 bg-[var(--surface-color)] cursor-grab active:cursor-grabbing shadow-sm hover:border-purple-500 transition-all flex items-center gap-3"
            >
              <span className="text-xs font-bold text-ink/40 w-5">{i + 1}</span>
              <p className="text-sm font-semibold flex-1">{event.de}</p>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => i > 0 && moveEvent(i, i - 1)} disabled={i === 0} className="text-[10px] px-1.5 py-0.5 border border-ink/10 rounded disabled:opacity-30">
                  Up
                </button>
                <button type="button" onClick={() => i < events.length - 1 && moveEvent(i, i + 1)} disabled={i === events.length - 1} className="text-[10px] px-1.5 py-0.5 border border-ink/10 rounded disabled:opacity-30">
                  Down
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={check} className="bg-purple-600 text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors">
          Check Order
        </button>
      </div>
    </GameShell>
  );
}
