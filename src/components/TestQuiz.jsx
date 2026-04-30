import { ListChecks, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import QuizRunner from "./QuizRunner.jsx";
import { buildTestQuestions } from "../utils/practice.js";

export default function TestQuiz({ chapters, onComplete }) {
  const [selected, setSelected] = useState(() => chapters.map((chapter) => chapter.id));
  const [questionSet, setQuestionSet] = useState(0);
  const selectedKey = selected.join("|");
  const selectedChapters = useMemo(
    () => chapters.filter((chapter) => selected.includes(chapter.id)),
    [chapters, selectedKey]
  );
  const questions = useMemo(() => buildTestQuestions(selectedChapters), [selectedChapters, questionSet]);

  function toggleChapter(chapterId) {
    setSelected((current) => {
      if (current.includes(chapterId)) {
        const next = current.filter((id) => id !== chapterId);
        return next.length ? next : current;
      }

      return [...current, chapterId];
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-coral">
          <ListChecks size={16} />
          Test & Quiz
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Chapter range test</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => toggleChapter(chapter.id)}
            className={`border px-3 py-2 text-sm font-semibold ${
              selected.includes(chapter.id) ? "border-marigold bg-marigold text-white" : "border-ink/10 bg-[var(--surface-color)]"
            }`}
          >
            Chapter {chapter.number}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setQuestionSet((current) => current + 1)}
        className="inline-flex items-center gap-2 border border-ink/15 bg-[var(--surface-color)] px-4 py-2 font-semibold shadow-sm"
      >
        <Shuffle size={18} />
        New question set
      </button>

      <QuizRunner key={`${selectedKey}-${questionSet}`} questions={questions} scopeId="range-test" title="Range Test" onComplete={onComplete} />
    </section>
  );
}
