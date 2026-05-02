import { CheckCircle2, RotateCcw, Volume2, Turtle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { isCorrectAnswer, shuffle } from "../utils/practice.js";
import { useTTS } from "../hooks/useTTS.js";
import { useKeyboardNav } from "../hooks/useKeyboardNav.js";
import { useGrammarRef } from "./GrammarRefDrawer.jsx";

export default function GrammarPractice({ chapter }) {
  const [index, setIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [selected, setSelected] = useState([]);
  const [choice, setChoice] = useState("");
  const [feedback, setFeedback] = useState(null);
  const { speak, speakSlow } = useTTS();
  const { openRef } = useGrammarRef();
  const isGrammarTheme = chapter.type === "grammarFocus";
  const accentText = isGrammarTheme ? "text-purple-600 dark:text-purple-400" : "text-marigold";
  const accentButton = isGrammarTheme ? "bg-purple-600 hover:bg-purple-700" : "bg-marigold hover:bg-marigold/80";
  const accentBorder = isGrammarTheme ? "focus:ring-purple-500 focus:border-purple-500" : "focus:ring-marigold focus:border-marigold";

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
    let isCorrect = false;
    if (item.type === "fill_blank") {
      isCorrect = isCorrectAnswer(textAnswer, item.answer);
      setFeedback(isCorrect ? "correct" : "review");
    }

    if (item.type === "choice") {
      isCorrect = isCorrectAnswer(choice, item.answer);
      setFeedback(isCorrect ? "correct" : "review");
    }

    if (item.type === "sentence_order") {
      isCorrect = isCorrectAnswer(selected.join(" "), item.answer.join(" "));
      setFeedback(isCorrect ? "correct" : "review");
    }
  }

  useKeyboardNav({
    onNumber: (num) => {
      if (item.type === "choice" && num >= 1 && num <= item.options.length) {
        setChoice(item.options[num - 1]);
      } else if (item.type === "sentence_order" && num >= 1 && num <= shuffledTokens.length) {
        // Toggle token selection
        const token = shuffledTokens[num - 1];
        if (!selected.includes(token)) {
          setSelected(current => [...current, token]);
        }
      }
    },
    onEnter: () => {
      if (feedback) next();
      else check();
    },
    onSpace: () => {
      if (item.prompt.match(/[a-zA-ZäöüÄÖÜß]/)) speak(item.prompt);
    }
  });

  return (
    <section className="min-h-[520px] w-full max-w-3xl space-y-6">
      <article className="min-h-[360px] glass-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${accentText}`}>{item.topic}</p>
            <p className="mt-2 text-xl font-bold">{item.prompt}</p>
          </div>
          {item.prompt.match(/[a-zA-ZäöüÄÖÜß]/) && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => speakSlow(item.prompt)}
                className={`p-2 rounded-full hover:bg-[var(--border-color)] ${accentText} transition-colors flex-shrink-0`}
                aria-label="Listen slowly"
              >
                <Turtle size={20} />
              </button>
              <button 
                onClick={() => speak(item.prompt)}
                className={`p-2 rounded-full hover:bg-[var(--border-color)] ${accentText} transition-colors flex-shrink-0`}
                aria-label="Listen"
              >
                <Volume2 size={20} />
              </button>
            </div>
          )}
        </div>

        {item.type === "fill_blank" && (
          <input
            value={textAnswer}
            onChange={(event) => setTextAnswer(event.target.value)}
            className={`mt-6 w-full rounded-lg border border-[var(--border-color)] bg-transparent px-4 py-3 focus:ring-2 ${accentBorder}`}
            placeholder={item.hint ?? "Type your answer"}
          />
        )}

        {item.type === "choice" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.options.map((option, i) => (
              <button
                key={option}
                type="button"
                onClick={() => setChoice(option)}
                className={`rounded-lg border px-4 py-3 text-left font-medium transition-all flex items-center gap-3 ${
                  choice === option 
                    ? `${isGrammarTheme ? "border-purple-600 bg-purple-600" : "border-marigold bg-marigold"} text-white shadow-md`
                    : `${isGrammarTheme ? "border-[var(--border-color)] bg-[var(--surface-color)] hover:border-purple-400" : "border-[var(--border-color)] bg-[var(--surface-color)] hover:border-marigold/50"} hover:bg-[var(--border-color)]`
                }`}
              >
                <span className="opacity-50 text-sm font-bold bg-ink/10 px-2 py-0.5 rounded">{i + 1}</span>
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
                  disabled={selected.includes(token)}
                  onClick={() => setSelected((current) => [...current, token])}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-2 font-semibold hover:bg-[var(--border-color)] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="opacity-40 text-xs font-bold">{tokenIndex + 1}</span>
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" onClick={check} className={`inline-flex items-center gap-2 rounded-lg ${accentButton} transition-colors px-6 py-2.5 font-semibold text-white shadow-md`}>
            <CheckCircle2 size={18} />
            Check
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--border-color)] transition-colors px-6 py-2.5 font-semibold">
            <RotateCcw size={18} />
            Reset
          </button>
          <Feedback status={feedback} answer={Array.isArray(item.answer) ? item.answer.join(" ") : item.answer} accent={isGrammarTheme ? "purple" : "marigold"} />
          
          {feedback === "review" && (item.grammarRef || chapter.type === "grammarFocus") && (
            <button 
              type="button" 
              onClick={() => openRef(item.grammarRef || chapter.id)} 
              className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Review this concept →
            </button>
          )}
        </div>
      </article>

      <button type="button" onClick={next} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--border-color)] transition-colors px-6 py-2.5 font-semibold shadow-sm w-full sm:w-auto">
        Next exercise
      </button>
    </section>
  );
}

function Feedback({ status, answer, accent = "marigold" }) {
  if (!status) return null;

  return (
    <span className={status === "correct" ? `font-semibold ${accent === "purple" ? "text-purple-600 dark:text-purple-400" : "text-marigold"}` : "font-semibold text-coral"}>
      {status === "correct" ? "Correct" : `Review: ${answer}`}
    </span>
  );
}
