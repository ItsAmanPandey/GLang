import { CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { isCorrectAnswer, shuffle } from "../utils/practice.js";
import { useTTS } from "../hooks/useTTS.js";

export default function GrammarPractice({ chapter }) {
  const [index, setIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [selected, setSelected] = useState([]);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState(null);
  const { speak } = useTTS();

  const item = chapter.practice[index % chapter.practice.length];
  const shuffledTokens = useMemo(() => (item.tokens ? shuffle(item.tokens) : []), [item]);

  // Auto-play TTS on correct answer for sentence order
  useEffect(() => {
    if (feedback === "correct" && item.type === "sentence_order") {
      speak(item.answer.join(" "));
    }
  }, [feedback, item, speak]);

  function reset() {
    setTextAnswer("");
    setSelected([]);
    setChoice("");
    setFeedback(null);
  }

  function next() {
    setIndex((current) => (current + 1) % chapter.practice.length);
    reset();
  }

  function check() {
    if (item.type === "fill_blank") {
      setFeedback(isCorrectAnswer(textAnswer, item.answer) ? "correct" : "review");
    }

    if (item.type === "choice") {
      setFeedback(isCorrectAnswer(choice, item.answer) ? "correct" : "review");
    }

    if (item.type === "sentence_order") {
      setFeedback(isCorrectAnswer(selected.join(" "), item.answer.join(" ")) ? "correct" : "review");
    }
  }

  return (
    <section className="max-w-2xl space-y-6">
      <article className="glass-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-marigold">{item.topic}</p>
            <p className="mt-2 text-xl font-bold">{item.prompt}</p>
          </div>
          {item.prompt.match(/[a-zA-ZäöüÄÖÜß]/) && (
            <button 
              onClick={() => speak(item.prompt)}
              className="p-2 rounded-full hover:bg-[var(--border-color)] text-marigold transition-colors flex-shrink-0"
              aria-label="Listen"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>

        {item.type === "fill_blank" && (
          <input
            value={textAnswer}
            onChange={(event) => setTextAnswer(event.target.value)}
            className="mt-6 w-full rounded-lg border border-[var(--border-color)] bg-transparent px-4 py-3 focus:ring-2 focus:ring-marigold focus:border-marigold"
            placeholder={item.hint ?? "Type your answer"}
          />
        )}

        {item.type === "choice" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setChoice(option)}
                className={`rounded-lg border px-4 py-3 text-left font-medium transition-all ${
                  choice === option 
                    ? "border-marigold bg-marigold text-white shadow-md" 
                    : "border-[var(--border-color)] bg-[var(--surface-color)] hover:border-marigold/50 hover:bg-[var(--border-color)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {item.type === "sentence_order" && (
          <div className="mt-6 space-y-5">
            <div className="min-h-[3.5rem] rounded-lg border-2 border-dashed border-[var(--border-color)] bg-transparent p-3 text-lg font-medium flex items-center">
              {selected.length ? selected.join(" ") : <span className="opacity-30">Build the sentence...</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {shuffledTokens.map((token, tokenIndex) => (
                <button
                  key={`${token}-${tokenIndex}`}
                  type="button"
                  onClick={() => setSelected((current) => [...current, token])}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-2 font-semibold hover:bg-[var(--border-color)] transition-colors shadow-sm"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" onClick={check} className="inline-flex items-center gap-2 rounded-lg bg-marigold hover:bg-marigold/80 transition-colors px-6 py-2.5 font-semibold text-white shadow-md">
            <CheckCircle2 size={18} />
            Check
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--border-color)] transition-colors px-6 py-2.5 font-semibold">
            <RotateCcw size={18} />
            Reset
          </button>
          <Feedback status={feedback} answer={Array.isArray(item.answer) ? item.answer.join(" ") : item.answer} />
        </div>
      </article>

      <button type="button" onClick={next} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--border-color)] transition-colors px-6 py-2.5 font-semibold shadow-sm w-full sm:w-auto">
        Next exercise
      </button>
    </section>
  );
}

function Feedback({ status, answer }) {
  if (!status) return null;

  return (
    <span className={status === "correct" ? "font-semibold text-marigold" : "font-semibold text-coral"}>
      {status === "correct" ? "Correct" : `Review: ${answer}`}
    </span>
  );
}
