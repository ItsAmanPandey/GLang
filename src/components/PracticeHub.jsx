import { BookOpen, Dumbbell } from "lucide-react";
import VocabularyPractice from "./VocabularyPractice.jsx";

export default function PracticeHub({ chapters, selectedChapterId, onSelectChapter }) {
  const chapter = chapters.find((item) => item.id === selectedChapterId) ?? chapters[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-coral">
            <Dumbbell size={16} />
            Practice Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Vocabulary drills</h1>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-ink/70">
          <span className="inline-flex items-center gap-2">
            <BookOpen size={16} />
            Chapter
          </span>
          <select
            value={chapter.id}
            onChange={(event) => onSelectChapter(event.target.value)}
            className="border border-ink/15 bg-[var(--surface-color)] px-3 py-2 text-ink"
          >
            {chapters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.number}. {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <VocabularyPractice chapter={chapter} />
    </section>
  );
}
