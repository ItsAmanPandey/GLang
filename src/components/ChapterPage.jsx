import { BookOpen, CheckCircle2, Dumbbell, Gamepad2, GraduationCap, Lightbulb, ListChecks, NotebookTabs } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GamesPanel from "./GamesPanel.jsx";
import GrammarPractice from "./GrammarPractice.jsx";
import QuizRunner from "./QuizRunner.jsx";
import VocabularyPractice from "./VocabularyPractice.jsx";

const tabs = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "vocabulary", label: "Vocabulary", icon: NotebookTabs },
  { id: "grammar", label: "Grammar", icon: GraduationCap },
  { id: "practice", label: "Practice", icon: Dumbbell },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "quiz", label: "Quiz", icon: ListChecks },
];

export default function ChapterPage({ chapter, chapters = [], isComplete, score, onRemember, onComplete, onQuizComplete }) {
  const [activeTab, setActiveTab] = useState("overview");
  const quizQuestions = useMemo(() => chapter.quiz, [chapter]);

  useEffect(() => {
    onRemember(chapter.id);
  }, [chapter.id, onRemember]);

  return (
    <section className="space-y-6">
      <div className="grid min-h-[240px] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">Chapter {chapter.number}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-5xl">{chapter.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink/65">{chapter.subtitle}</p>
        </div>
        <div className="min-h-[232px] border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft">
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
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-marigold px-4 py-3 font-semibold text-white"
          >
            <CheckCircle2 size={18} />
            Mark Complete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-ink/10 pb-3 sm:grid-cols-3 lg:grid-cols-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-12 min-w-0 items-center justify-center gap-2 border px-3 text-sm font-semibold ${
                activeTab === tab.id ? "border-ink bg-ink text-[var(--bg-color)]" : "border-ink/10 bg-[var(--surface-color)]"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[560px]">
      {activeTab === "overview" && <Overview chapter={chapter} />}
      {activeTab === "vocabulary" && (
        <div className="space-y-8">
          <VocabularyPractice chapter={chapter} />
          <VocabularyList vocabulary={chapter.vocabulary} />
        </div>
      )}
      {activeTab === "grammar" && <GrammarList grammar={chapter.grammar} />}
      {activeTab === "practice" && <GrammarPractice chapter={chapter} />}
      {activeTab === "games" && <GamesPanel chapter={chapter} chapters={chapters} />}
      {activeTab === "quiz" && (
        <QuizRunner questions={quizQuestions} scopeId={chapter.id} title={chapter.title} onComplete={onQuizComplete} />
      )}
      </div>
    </section>
  );
}

function Overview({ chapter }) {
  return (
    <section className="grid items-stretch gap-5 lg:grid-cols-3">
      <div className="min-h-[245px] border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft lg:col-span-2">
        <h2 className="text-xl font-bold">Focus</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {chapter.focus.map((goal) => (
            <div key={goal} className="flex min-h-[62px] items-center border border-ink/10 bg-[var(--surface-color)] p-3 font-semibold">
              {goal}
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[245px] border border-slate-900/10 bg-peachglass p-5 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Chapter Summary</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-900/10 pb-2">
            <dt className="text-slate-900/60">Words</dt>
            <dd className="font-semibold text-slate-900">{chapter.vocabulary.length}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-900/10 pb-2">
            <dt className="text-slate-900/60">Grammar</dt>
            <dd className="font-semibold text-slate-900">{chapter.grammar.length}</dd>
          </div>
          <div className="flex justify-between pb-1">
            <dt className="text-slate-900/60">Quiz</dt>
            <dd className="font-semibold text-slate-900">{chapter.games.length}</dd>
          </div>
        </dl>
      </div>
      {chapter.tips?.length > 0 && <LearningTips tips={chapter.tips} />}
    </section>
  );
}

function LearningTips({ tips }) {
  return (
    <div className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft lg:col-span-3">
      <div className="flex items-center gap-2">
        <Lightbulb size={20} className="text-marigold" />
        <h2 className="text-xl font-bold">Tips</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {tips.map((tip) => (
          <article key={tip.title} className="min-h-[150px] border border-ink/10 bg-[var(--surface-color)] p-4">
            <h3 className="font-bold">{tip.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">{tip.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function VocabularyList({ vocabulary }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {vocabulary.map((item) => (
        <article key={item.word} className="min-h-[180px] border border-ink/10 bg-[var(--surface-color)] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold">{item.word}</h3>
            {item.article && <span className="bg-marigold/25 px-2 py-1 text-xs font-bold text-ink">{item.article}</span>}
          </div>
          <p className="mt-1 text-marigold">{item.meaning}</p>
          {item.plural && <p className="mt-2 text-sm text-ink/55">Plural: {item.plural}</p>}
          <p className="mt-3 text-sm text-ink/70">{item.example}</p>
        </article>
      ))}
    </section>
  );
}

function GrammarList({ grammar }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {grammar.map((item) => (
        <article key={item.topic} className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-sm">
          <h3 className="text-xl font-bold">{item.topic}</h3>
          <p className="mt-2 text-ink/70">{item.explanation}</p>
          <div className="mt-4 space-y-2">
            {item.examples.map((example) => (
              <p key={example} className="border-l-4 border-marigold bg-[var(--surface-color)] px-3 py-2 font-semibold">
                {example}
              </p>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
