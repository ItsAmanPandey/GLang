import { ArrowRight, Lock, Unlock } from "lucide-react";

export default function LevelSelect({ levels, onOpenLevel }) {
  return (
    <section className="space-y-8">
      <div className="learning-grid border border-ink/10 bg-[var(--surface-color)] p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">Local German Course</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-6xl">Choose your level</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/65">
          Start with A1 now. A2 is prepared as a future level and stays closed until you add content.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {levels.map((level) => {
          const isOpen = level.status === "Open";
          const Icon = isOpen ? Unlock : Lock;

          return (
            <article key={level.id} className={`border p-6 shadow-sm ${isOpen ? "border-ink/10 bg-[var(--surface-color)]" : "border-ink/10 bg-ink/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-coral">{level.label}</p>
                  <h2 className="mt-2 text-3xl font-bold">{level.title}</h2>
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-bold ${isOpen ? "bg-marigold text-white" : "bg-[var(--surface-color)] text-ink/55"}`}>
                  <Icon size={16} />
                  {level.status}
                </span>
              </div>
              <p className="mt-4 text-ink/65">{level.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {level.highlights.map((highlight) => (
                  <span key={highlight} className="bg-peachglass px-2 py-1 text-xs font-semibold text-slate-900">
                    {highlight}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => isOpen && onOpenLevel(level.id)}
                disabled={!isOpen}
                className={`mt-6 inline-flex items-center gap-2 font-semibold ${
                  isOpen ? "text-marigold" : "cursor-not-allowed text-ink/35"
                }`}
              >
                {isOpen ? "Open level" : "Closed"}
                {isOpen && <ArrowRight size={18} />}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
