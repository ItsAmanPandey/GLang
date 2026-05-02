import { createContext, useContext, useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { useKeyboardNav } from "../hooks/useKeyboardNav.js";

const GrammarRefContext = createContext({
  openRef: (refId) => {},
});

export function GrammarRefProvider({ children, chapters }) {
  const [activeRef, setActiveRef] = useState(null);
  
  const activeChapter = activeRef ? findGrammarChapter(chapters, activeRef) : null;

  return (
    <GrammarRefContext.Provider value={{ openRef: setActiveRef }}>
      {children}
      {activeChapter && (
        <GrammarRefDrawer chapter={activeChapter} onClose={() => setActiveRef(null)} />
      )}
    </GrammarRefContext.Provider>
  );
}

export const useGrammarRef = () => useContext(GrammarRefContext);

function findGrammarChapter(chapters, refId) {
  return chapters.find((chapter) => (
    chapter.id === refId ||
    chapter.number === refId ||
    chapter.id === `A1_${refId}` ||
    chapter.id.endsWith(`_${refId}`)
  ));
}

function GrammarRefDrawer({ chapter, onClose }) {
  const concept = chapter.conceptSections?.[0]; // Show the first concept as a reference

  useKeyboardNav({
    onEscape: onClose,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[var(--bg-color)] shadow-xl overflow-y-auto border-l border-purple-200 dark:border-purple-900 animate-slide-in-right"
      >
        <div className="sticky top-0 bg-[var(--bg-color)] border-b border-purple-100 dark:border-purple-900/50 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <BookOpen size={20} />
            <h2 className="font-bold uppercase tracking-wide text-sm">{chapter.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 text-ink/50 hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {concept ? (
            <article className="space-y-6">
              <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400">{concept.heading}</h3>
              <p className="text-lg leading-relaxed text-ink/80">{concept.explanation}</p>
              
              {concept.table && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        {concept.table.headers.map((h, i) => (
                          <th key={i} className="border-b-2 border-purple-200 dark:border-purple-800 p-2 font-bold bg-purple-50 dark:bg-purple-900/20 text-sm">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {concept.table.rows.map((row, i) => (
                        <tr key={i} className="border-b border-ink/10">
                          {row.map((cell, j) => (
                            <td key={j} className="p-2 text-sm font-medium">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {concept.examples?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wide text-ink/50">Examples</h4>
                  {concept.examples.map((ex, i) => (
                    <div key={i} className="border-l-4 border-purple-400 bg-purple-50/30 dark:bg-purple-900/10 p-3 text-sm">
                      <p className="font-bold">{ex.de}</p>
                      <p className="text-ink/60">{ex.en}</p>
                      {ex.note && <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">{ex.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <p className="text-ink/50">No reference content available.</p>
          )}

          <div className="mt-8 pt-6 border-t border-ink/10">
            <button 
              onClick={onClose}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
