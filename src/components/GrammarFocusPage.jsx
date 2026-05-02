import { BookOpen, CheckCircle2, Dumbbell, Gamepad2, GraduationCap, ListChecks, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GamesPanel from "./GamesPanel.jsx";
import GrammarPractice from "./GrammarPractice.jsx";
import QuizRunner from "./QuizRunner.jsx";

const tabs = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "concepts", label: "Concepts", icon: GraduationCap },
  { id: "practice", label: "Practice", icon: Dumbbell },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "quiz", label: "Quiz", icon: ListChecks },
];

export default function GrammarFocusPage({ chapter, chapters = [], isComplete, score, onRemember, onComplete, onQuizComplete }) {
  const [activeTab, setActiveTab] = useState("overview");
  const quizQuestions = useMemo(() => chapter.quiz, [chapter]);

  useEffect(() => {
    onRemember(chapter.id);
  }, [chapter.id, onRemember]);

  return (
    <section className="space-y-6">
      <div className="grid min-h-[240px] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">Grammar Focus {chapter.number.replace('GF', '')}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-5xl">{chapter.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink/65">{chapter.subtitle}</p>
        </div>
        <div className="min-h-[232px] border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10 p-5 shadow-soft rounded-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">Status</p>
          <p className="mt-2 text-2xl font-bold">{isComplete ? "Completed" : "In progress"}</p>
          {score && (
            <p className="mt-2 text-sm text-ink/65">
              Last quiz: {score.score}/{score.total}
            </p>
          )}
          <button
            type="button"
            onClick={() => onComplete(chapter.id)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 transition-colors px-4 py-3 font-semibold text-white rounded-lg"
          >
            <CheckCircle2 size={18} />
            Mark Complete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-ink/10 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[calc(50%-4px)] sm:min-w-0 inline-flex h-11 items-center justify-center gap-2 border px-3 text-[13px] font-bold rounded-xl transition-all ${
                activeTab === tab.id ? "border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none" : "border-ink/10 bg-[var(--surface-color)] hover:border-purple-300 text-ink/70"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[560px]">
      {activeTab === "overview" && <Overview chapter={chapter} />}
      {activeTab === "concepts" && <ConceptList concepts={chapter.conceptSections} />}
      {activeTab === "practice" && <GrammarPractice chapter={chapter} />}
      {activeTab === "games" && <GamesPanel chapter={chapter} chapters={chapters} />}
      {activeTab === "quiz" && (
        <QuizRunner questions={quizQuestions} scopeId={chapter.id} title={chapter.title} onComplete={onQuizComplete} accent="purple" />
      )}
      </div>
    </section>
  );
}

function Overview({ chapter }) {
  return (
    <section className="grid items-stretch gap-5 lg:grid-cols-3">
      <div className="min-h-[245px] border border-purple-200 dark:border-purple-900/50 bg-[var(--surface-color)] p-5 shadow-soft lg:col-span-2 rounded-xl">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300">Grammar Goals</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {chapter.focus.map((goal) => (
            <div key={goal} className="flex min-h-[62px] items-center border border-purple-100 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20 p-3 font-semibold rounded-lg">
              {goal}
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[245px] border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 shadow-soft rounded-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-800 dark:text-purple-200">Chapter Summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-purple-200 dark:border-purple-800 pb-2 gap-4">
            <dt className="text-ink/60">Concepts</dt>
            <dd className="font-semibold">{chapter.conceptSections.length}</dd>
          </div>
          <div className="flex justify-between border-b border-purple-200 dark:border-purple-800 pb-2 gap-4">
            <dt className="text-ink/60">Practice Items</dt>
            <dd className="font-semibold">{chapter.practice.length}</dd>
          </div>
          <div className="flex justify-between pb-1 gap-4">
            <dt className="text-ink/60">Games</dt>
            <dd className="font-semibold">{chapter.games.length}</dd>
          </div>
        </dl>
      </div>
      {chapter.tips?.length > 0 && <LearningTips tips={chapter.tips} />}
    </section>
  );
}

function LearningTips({ tips }) {
  return (
    <div className="border border-purple-200 dark:border-purple-900/50 bg-[var(--surface-color)] p-5 shadow-soft lg:col-span-3 rounded-xl">
      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
        <Lightbulb size={20} />
        <h2 className="text-xl font-bold">Pro Tips</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {tips.map((tip) => (
          <article key={tip.title} className="min-h-[150px] border border-ink/10 bg-[var(--surface-color)] p-4 rounded-lg">
            <h3 className="font-bold">{tip.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">{tip.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ConceptList({ concepts }) {
  return (
    <section className="grid gap-6">
      {concepts.map((concept) => (
        <article key={concept.id} className="border border-purple-100 dark:border-purple-900/30 bg-[var(--surface-color)] p-4 sm:p-6 shadow-sm rounded-xl">
          <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-3">{concept.heading}</h3>
          <p className="text-lg leading-relaxed text-ink/80 mb-6">{concept.explanation}</p>
          
          {concept.table && (
            <>
              {/* Desktop Table: Show full table */}
              <div className="hidden sm:block overflow-x-auto mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      {concept.table.headers.map((h, i) => (
                        <th key={i} className="border-b-2 border-purple-200 dark:border-purple-800 p-3 font-bold bg-purple-50 dark:bg-purple-900/20 text-sm uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {concept.table.rows.map((row, i) => (
                      <tr key={i} className="border-b border-ink/10 hover:bg-purple-50/50 dark:hover:bg-purple-900/10">
                        {row.map((cell, j) => (
                          <td key={j} className="p-3 text-sm font-medium">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Table: Split if too wide */}
              <div className="sm:hidden space-y-4 mb-6">
                {concept.table.headers.length > 4 ? (
                  <>
                    <div className="overflow-x-auto border border-ink/5 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            {[0, 1, 2, 3].map(idx => (
                              <th key={idx} className="border-b border-purple-200 p-1.5 font-bold bg-purple-50 text-[10px] uppercase tracking-wider">{concept.table.headers[idx]}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {concept.table.rows.map((row, i) => (
                            <tr key={i} className="border-b border-ink/5">
                              {[0, 1, 2, 3].map(idx => (
                                <td key={idx} className="p-1.5 text-xs font-medium whitespace-nowrap">{row[idx]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="overflow-x-auto border border-ink/5 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            {[0, 4, 5, 6].filter(idx => idx < concept.table.headers.length).map(idx => (
                              <th key={idx} className="border-b border-purple-200 p-1.5 font-bold bg-purple-50 text-[10px] uppercase tracking-wider">{concept.table.headers[idx]}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {concept.table.rows.map((row, i) => (
                            <tr key={i} className="border-b border-ink/5">
                              {[0, 4, 5, 6].filter(idx => idx < concept.table.headers.length).map(idx => (
                                <td key={idx} className="p-1.5 text-xs font-medium whitespace-nowrap">{row[idx]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="overflow-x-auto border border-ink/5 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          {concept.table.headers.map((h, i) => (
                            <th key={i} className="border-b-2 border-purple-200 p-2 font-bold bg-purple-50 text-[10px] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {concept.table.rows.map((row, i) => (
                          <tr key={i} className="border-b border-ink/5">
                            {row.map((cell, j) => (
                              <td key={j} className="p-2 text-xs font-medium whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {concept.examples?.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-ink/50">Examples</h4>
              {concept.examples.map((ex, i) => (
                <div key={i} className="border-l-4 border-purple-400 bg-purple-50/30 dark:bg-purple-900/10 p-3 rounded-r-lg">
                  <p className="font-bold text-lg">{ex.de}</p>
                  <p className="text-ink/60">{ex.en}</p>
                  {ex.note && <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mt-1">Note: {ex.note}</p>}
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
