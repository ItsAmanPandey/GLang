import { CheckCircle2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { scoreAnswers } from "../utils/practice.js";

export default function QuizRunner({ questions, scopeId, onComplete, title = "Quiz" }) {
  const [answers, setAnswers] = useQuizAnswers(questions);
  const [result, setResult] = useQuizResult(questions);

  function updateAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  function submitQuiz() {
    const nextResult = scoreAnswers(questions, answers);
    setResult(nextResult);
    onComplete?.(scopeId, nextResult);
  }

  function resetQuiz() {
    setAnswers({});
    setResult(null);
  }

  if (!questions.length) {
    return <EmptyState label="No quiz questions yet." />;
  }

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);

    return (
      <section className="space-y-5">
        <div className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-marigold">{title} Result</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-4xl font-bold">{percent}%</span>
            <span className="pb-1 text-sm text-ink/65">
              {result.score} of {result.total} correct
            </span>
          </div>
          {result.weakTopics.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {result.weakTopics.map((topic) => (
                <span key={topic} className="border border-coral/30 bg-coral/10 px-3 py-1 text-sm text-coral">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-marigold">No weak topics recorded from this run.</p>
          )}
        </div>

        <div className="grid gap-3">
          {result.checked.map((question) => (
            <article key={question.id} className="border border-ink/10 bg-[var(--surface-color)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{question.prompt}</p>
                <span className={question.correct ? "text-marigold" : "text-coral"}>
                  {question.correct ? "Correct" : "Review"}
                </span>
              </div>
              {!question.correct && (
                <p className="mt-2 text-sm text-ink/70">
                  Answer: <span className="font-semibold">{formatAnswer(question.answer)}</span>
                </p>
              )}
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={resetQuiz}
          className="inline-flex items-center gap-2 border border-ink/15 bg-[var(--surface-color)] px-4 py-2 font-semibold shadow-sm"
        >
          <RotateCcw size={18} />
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {questions.map((question, index) => (
        <article key={question.id} className="border border-slate-900/10 bg-[var(--surface-color)] p-4 shadow-sm">
          <div className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center bg-peachglass text-slate-900 text-sm font-bold">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{question.prompt}</p>
              {question.chapterTitle && <p className="mt-1 text-xs uppercase tracking-wide text-slate-900/50">{question.chapterTitle}</p>}

              {question.type === "mcq" && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateAnswer(question.id, option)}
                      className={`border px-3 py-2 text-left transition ${
                        answers[question.id] === option
                          ? "border-marigold bg-marigold text-white"
                          : "border-ink/10 bg-[var(--surface-color)] hover:border-marigold/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.type === "fill_blank" && (
                <input
                  value={answers[question.id] ?? ""}
                  onChange={(event) => updateAnswer(question.id, event.target.value)}
                  className="mt-4 w-full border border-ink/15 bg-[var(--surface-color)] px-3 py-2"
                  placeholder="Type your answer"
                />
              )}
            </div>
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={submitQuiz}
        className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-semibold text-[var(--bg-color)] shadow-soft"
      >
        <CheckCircle2 size={18} />
        Submit
      </button>
    </section>
  );
}

function formatAnswer(answer) {
  return Array.isArray(answer) ? answer[0] : answer;
}

function EmptyState({ label }) {
  return <div className="border border-dashed border-ink/20 bg-[var(--surface-color)] p-6 text-center text-ink/60">{label}</div>;
}

function useQuizAnswers(questions) {
  const [answers, setAnswers] = useState(() => Object.fromEntries(questions.map((question) => [question.id, ""])));

  useEffect(() => {
    setAnswers(Object.fromEntries(questions.map((question) => [question.id, ""])));
  }, [questions]);

  return [answers, setAnswers];
}

function useQuizResult(questions) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    setResult(null);
  }, [questions]);

  return [result, setResult];
}
