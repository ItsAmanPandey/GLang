import { ArrowLeft, ArrowRight, BookOpen, RotateCcw, GraduationCap } from "lucide-react";
import ProgressRing from "./ProgressRing.jsx";

export default function Home({ levelId, chapters, progress, summary, onOpenChapter, onBackToLevels, onOpenPractice, onOpenTest, onReset }) {
  const completed = new Set(progress.completedChapters);

  const vocabChapters = chapters.filter(c => c.type !== "grammarFocus");
  const grammarChapters = chapters.filter(c => c.type === "grammarFocus");

  return (
    <section className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="learning-grid border border-ink/10 bg-[var(--surface-color)] p-6 shadow-soft sm:p-8 rounded-xl">
          <button type="button" onClick={onBackToLevels} className="inline-flex items-center gap-2 text-sm font-semibold text-marigold">
            <ArrowLeft size={16} />
            Levels
          </button>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-coral">Local German {levelId}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-6xl">{levelId} Chapters</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/65">
            Practice all {chapters.length} {levelId} chapters with local JSON content, games, and quizzes.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {summary.lastChapter && (
              <button
                type="button"
                onClick={() => onOpenChapter(summary.lastChapter.id)}
                className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-semibold text-[var(--bg-color)] shadow-soft rounded-lg"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            )}
            <button type="button" onClick={onOpenPractice} className="border border-ink/15 bg-[var(--surface-color)] hover:border-marigold/50 px-5 py-3 font-semibold rounded-lg transition-colors">
              Practice Hub
            </button>
            <button type="button" onClick={onOpenTest} className="border border-ink/15 bg-[var(--surface-color)] hover:border-marigold/50 px-5 py-3 font-semibold rounded-lg transition-colors">
              Test & Quiz
            </button>
          </div>
        </div>

        <aside className="border border-slate-900/10 bg-peachglass dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 p-6 shadow-soft rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-900/60 dark:text-slate-400">Progress</p>
              <p className="mt-2 text-2xl font-bold">
                {summary.completedCount}/{summary.chapterTotal} chapters
              </p>
            </div>
            <ProgressRing value={summary.percent} />
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex items-center gap-2 border border-ink/15 bg-[var(--surface-color)] hover:bg-ink/5 px-3 py-2 text-sm font-semibold text-[var(--text-color)] rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </aside>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen className="text-marigold" size={24} />
            Vocabulary Chapters
          </h2>
          <span className="bg-ink/5 text-ink/70 px-3 py-1 rounded-full text-sm font-semibold">{vocabChapters.length} Lessons</span>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {vocabChapters.map((chapter) => (
            <ChapterCard 
              key={chapter.id} 
              chapter={chapter} 
              isDone={completed.has(chapter.id)} 
              onOpen={() => onOpenChapter(chapter.id)} 
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 border-b border-purple-200 dark:border-purple-900/50 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-purple-700 dark:text-purple-400">
            <GraduationCap className="text-purple-500" size={28} />
            Grammar Focus
          </h2>
          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">{grammarChapters.length} Concepts</span>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {grammarChapters.map((chapter) => (
            <ChapterCard 
              key={chapter.id} 
              chapter={chapter} 
              isDone={completed.has(chapter.id)} 
              onOpen={() => onOpenChapter(chapter.id)} 
              isGrammar={true}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function ChapterCard({ chapter, isDone, onOpen, isGrammar }) {
  const accentColor = isGrammar ? "text-purple-600 dark:text-purple-400" : "text-coral";
  const bgBadgeColor = isGrammar ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200" : "bg-peachglass dark:bg-ink/10 text-slate-900 dark:text-ink";
  const borderColor = isGrammar ? "border-purple-200 dark:border-purple-900/50 hover:border-purple-400" : "border-ink/10 hover:border-marigold/50";
  const doneBadgeColor = isGrammar ? "bg-purple-600 text-white" : "bg-marigold text-white";
  const actionColor = isGrammar ? "text-purple-600 dark:text-purple-400" : "text-marigold";

  return (
    <article className={`relative min-h-[250px] border ${borderColor} bg-[var(--surface-color)] p-5 shadow-sm rounded-xl transition-all hover:shadow-md flex flex-col`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-wide ${accentColor}`}>
            {isGrammar ? "Concept" : "Chapter"} {String(chapter.number).replace("GF", "")}
          </p>
          <h3 className="mt-2 text-xl font-bold leading-tight">{chapter.title}</h3>
        </div>
        <span className={isDone ? `${doneBadgeColor} px-2 py-1 text-xs font-bold rounded shadow-sm` : "bg-ink/5 px-2 py-1 text-xs font-bold text-ink/50 rounded"}>
          {isDone ? "Done" : "Open"}
        </span>
      </div>
      <p className="mt-3 min-h-[44px] text-sm text-ink/60 flex-grow">{chapter.subtitle}</p>

      <div className="mt-4 flex min-h-[58px] flex-wrap content-start gap-2">
        {chapter.focus.slice(0, 2).map((goal) => (
          <span key={goal} className={`${bgBadgeColor} px-2 py-1 text-xs font-semibold rounded-md`}>
            {goal}
          </span>
        ))}
      </div>
      
      <button
        type="button"
        onClick={onOpen}
        className={`mt-5 inline-flex items-center gap-2 font-bold ${actionColor} hover:opacity-80 transition-opacity`}
      >
        Open Lesson
        <ArrowRight size={18} />
      </button>
    </article>
  );
}
