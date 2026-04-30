import { BookOpen, Home as HomeIcon, Layers, ListChecks, Loader2, Dumbbell, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ChapterPage from "./components/ChapterPage.jsx";
import Home from "./components/Home.jsx";
import LevelSelect from "./components/LevelSelect.jsx";
import PracticeHub from "./components/PracticeHub.jsx";
import TestQuiz from "./components/TestQuiz.jsx";
import { loadChapters } from "./data/content.js";
import { useProgress } from "./hooks/useProgress.js";

const views = {
  levels: "levels",
  home: "home",
  chapter: "chapter",
  practice: "practice",
  test: "test",
};

const levels = [
  {
    id: "A1",
    label: "Level A1",
    title: "A1 German",
    status: "Open",
    description: "All 24 A1 chapters covering vocabulary, grammar, interactive games, and tests.",
    highlights: ["24 chapters", "local progress", "practice games"],
  },
  {
    id: "A2",
    label: "Level A2",
    title: "A2 German",
    status: "Closed",
    description: "Reserved for the next course level. The app structure is ready, but content is not added yet.",
    highlights: ["future content", "closed", "coming later"],
  },
];

export default function App() {
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState(views.levels);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const progressApi = useProgress(chapters);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0];
  const { rememberChapter: storeLastChapter, saveQuizScore } = progressApi;

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    loadChapters()
      .then((loadedChapters) => {
        setChapters(loadedChapters);
        setSelectedChapterId(loadedChapters[0]?.id ?? null);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const rememberChapter = useCallback(
    (chapterId) => {
      storeLastChapter(chapterId);
      setSelectedChapterId(chapterId);
    },
    [storeLastChapter]
  );

  const handleQuizComplete = useCallback(
    (scopeId, result) => {
      saveQuizScore(scopeId, result);
    },
    [saveQuizScore]
  );

  function openChapter(chapterId) {
    setSelectedChapterId(chapterId);
    setView(views.chapter);
  }

  function openLevel(levelId) {
    setSelectedLevelId(levelId);
    setView(views.home);
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--surface-color)] p-6">
        <div className="border border-coral/30 bg-[var(--surface-color)] p-6 text-coral shadow-soft">{error}</div>
      </main>
    );
  }

  if (!chapters.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--surface-color)] p-6">
        <Loader2 className="animate-spin text-marigold" size={40} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      <header className="sticky top-0 z-20 glass border-b-0 border-b-[var(--border-color)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              setSelectedLevelId(null);
              setView(views.levels);
            }}
            className="flex items-center gap-3 text-left group"
          >
            <span className="grid h-10 w-10 place-items-center bg-marigold text-white rounded-xl shadow-glow group-hover:scale-105 transition-transform">
              <BookOpen size={20} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">G Lang</span>
              <span className="block text-xs uppercase tracking-wide opacity-60 font-semibold">{selectedLevelId ? `${selectedLevelId} chapters` : "Levels"}</span>
            </span>
          </button>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 bg-[var(--border-color)] p-1 rounded-lg">
              <NavButton
                active={view === views.levels}
                label="Levels"
                icon={Layers}
                onClick={() => {
                  setSelectedLevelId(null);
                  setView(views.levels);
                }}
              />
              {selectedLevelId && <NavButton active={view === views.home} label="Home" icon={HomeIcon} onClick={() => setView(views.home)} />}
              {selectedLevelId && <NavButton active={view === views.practice} label="Practice" icon={Dumbbell} onClick={() => setView(views.practice)} />}
              {selectedLevelId && <NavButton active={view === views.test} label="Test" icon={ListChecks} onClick={() => setView(views.test)} />}
            </nav>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {view === views.levels && <LevelSelect levels={levels} onOpenLevel={openLevel} />}

        {view === views.home && (
          <Home
            levelId={selectedLevelId}
            chapters={chapters}
            progress={progressApi.progress}
            summary={progressApi.summary}
            onOpenChapter={openChapter}
            onBackToLevels={() => {
              setSelectedLevelId(null);
              setView(views.levels);
            }}
            onOpenPractice={() => setView(views.practice)}
            onOpenTest={() => setView(views.test)}
            onReset={progressApi.resetProgress}
          />
        )}

        {view === views.chapter && selectedChapter && (
          <ChapterPage
            chapter={selectedChapter}
            isComplete={progressApi.progress.completedChapters.includes(selectedChapter.id)}
            score={progressApi.progress.quizScores[selectedChapter.id]}
            onRemember={rememberChapter}
            onComplete={progressApi.markChapterComplete}
            onQuizComplete={handleQuizComplete}
          />
        )}

        {view === views.practice && (
          <PracticeHub
            chapters={chapters}
            selectedChapterId={selectedChapter?.id}
            onSelectChapter={(chapterId) => {
              setSelectedChapterId(chapterId);
              progressApi.rememberChapter(chapterId);
            }}
          />
        )}

        {view === views.test && <TestQuiz chapters={chapters} onComplete={handleQuizComplete} />}
      </main>
    </div>
  );
}

function NavButton({ active, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-all duration-200 ${
        active 
          ? "bg-[var(--bg-color)] text-marigold shadow-sm" 
          : "text-[var(--text-color)] opacity-70 hover:opacity-100 hover:bg-[var(--surface-color)]"
      }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
