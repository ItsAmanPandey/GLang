import { ArrowLeft, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import ProgressRing from "./ProgressRing.jsx";

export default function Home({ levelId, chapters, progress, summary, onOpenChapter, onBackToLevels, onOpenPractice, onOpenTest, onReset }) {
  const completed = new Set(progress.completedChapters);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="learning-grid border border-ink/10 bg-[var(--surface-color)] p-6 shadow-soft sm:p-8">
          <button type="button" onClick={onBackToLevels} className="inline-flex items-center gap-2 text-sm font-semibold text-marigold">
            <ArrowLeft size={16} />
            Levels
          </button>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-coral">Local German {levelId}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-6xl">{levelId} Chapters</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/65">
            Practice all {chapters.length} {levelId} chapters with local JSON content and browser progress.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {summary.lastChapter && (
              <button
                type="button"
                onClick={() => onOpenChapter(summary.lastChapter.id)}
                className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-semibold text-[var(--bg-color)] shadow-soft"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            )}
            <button type="button" onClick={onOpenPractice} className="border border-ink/15 bg-[var(--surface-color)] px-5 py-3 font-semibold">
              Practice Hub
            </button>
            <button type="button" onClick={onOpenTest} className="border border-ink/15 bg-[var(--surface-color)] px-5 py-3 font-semibold">
              Test & Quiz
            </button>
          </div>
        </div>

        <aside className="border border-slate-900/10 bg-peachglass text-slate-900 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-900/60">Progress</p>
              <p className="mt-2 text-2xl font-bold">
                {summary.completedCount}/{summary.chapterTotal} chapters
              </p>
            </div>
            <ProgressRing value={summary.percent} />
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex items-center gap-2 border border-ink/15 bg-[var(--surface-color)] px-3 py-2 text-sm font-semibold text-[var(--text-color)]"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </aside>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">All Chapters</h2>
          <BookOpen className="text-marigold" size={24} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-coral">Chapter {chapter.number}</p>
                  <h3 className="mt-2 text-xl font-bold">{chapter.title}</h3>
                </div>
                <span className={completed.has(chapter.id) ? "bg-marigold px-2 py-1 text-xs font-bold text-white" : "bg-[var(--surface-color)] px-2 py-1 text-xs font-bold text-ink/60"}>
                  {completed.has(chapter.id) ? "Done" : "Open"}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/60">{chapter.subtitle}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {chapter.focus.slice(0, 2).map((goal) => (
                  <span key={goal} className="bg-peachglass px-2 py-1 text-xs font-semibold text-slate-900">
                    {goal}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onOpenChapter(chapter.id)}
                className="mt-5 inline-flex items-center gap-2 font-semibold text-marigold"
              >
                Open
                <ArrowRight size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
