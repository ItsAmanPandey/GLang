import { RotateCcw, Trophy } from "lucide-react";

export default function GameShell({ title, score, total, completed, children, onPlayAgain, accent = "marigold" }) {
  const theme = accent === "purple"
    ? {
        text: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-600 hover:bg-purple-700",
        bar: "bg-purple-600",
      }
    : {
        text: "text-marigold",
        bg: "bg-marigold hover:bg-marigold/80",
        bar: "bg-marigold",
      };

  if (completed) {
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div className="min-h-[420px] sm:min-h-[500px] border border-ink/10 bg-[var(--surface-color)] p-6 shadow-soft rounded-2xl animate-fade-in flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Trophy className={`mx-auto ${theme.text}`} size={48} />
          <h3 className="text-2xl font-bold">{title} - Complete!</h3>
          <p className={`text-5xl font-bold ${theme.text}`}>{percent}%</p>
          <p className="text-ink/60">{score} of {total} correct</p>
          <div className="h-3 bg-ink/10 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className={`h-full ${theme.bar} rounded-full transition-all duration-700`} style={{ width: `${percent}%` }} />
          </div>
          <button
            type="button"
            onClick={onPlayAgain}
            className={`inline-flex items-center gap-2 ${theme.bg} px-6 py-3 font-semibold text-white rounded-xl shadow-md transition-colors`}
          >
            <RotateCcw size={18} />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[420px] sm:min-h-[500px] border border-ink/10 bg-[var(--surface-color)] p-4 sm:p-6 shadow-soft rounded-2xl flex flex-col justify-start sm:justify-center relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {total > 0 && (
          <span className="text-sm font-semibold text-ink/60">
            {score}/{total}
          </span>
        )}
      </div>
      {total > 0 && (
        <div className="h-2 bg-ink/10 rounded-full overflow-hidden mb-4">
          <div className={`h-full ${theme.bar} rounded-full transition-all duration-300`} style={{ width: `${(score / total) * 100}%` }} />
        </div>
      )}
      <div className="flex-1 w-full flex flex-col justify-start sm:justify-center">
        {children}
      </div>
    </div>
  );
}
