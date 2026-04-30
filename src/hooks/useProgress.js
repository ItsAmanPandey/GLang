import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

const initialProgress = {
  completedChapters: [],
  quizScores: {},
  weakTopics: {},
  lastChapterId: null,
};

export function useProgress(chapters) {
  const [progress, setProgress] = useLocalStorage("g-lang-progress-v1", initialProgress);

  const completedCount = progress.completedChapters.length;
  const chapterTotal = chapters.length;
  const percent = chapterTotal ? Math.round((completedCount / chapterTotal) * 100) : 0;

  const summary = useMemo(
    () => ({
      completedCount,
      chapterTotal,
      percent,
      lastChapter: chapters.find((chapter) => chapter.id === progress.lastChapterId) ?? chapters[0],
    }),
    [chapters, completedCount, chapterTotal, percent, progress.lastChapterId]
  );

  const rememberChapter = useCallback((chapterId) => {
    setProgress((current) => ({
      ...current,
      lastChapterId: chapterId,
    }));
  }, [setProgress]);

  const markChapterComplete = useCallback((chapterId) => {
    setProgress((current) => ({
      ...current,
      lastChapterId: chapterId,
      completedChapters: current.completedChapters.includes(chapterId)
        ? current.completedChapters
        : [...current.completedChapters, chapterId],
    }));
  }, [setProgress]);

  const saveQuizScore = useCallback((scopeId, result) => {
    setProgress((current) => {
      const weakTopics = { ...current.weakTopics };

      result.weakTopics.forEach((topic) => {
        weakTopics[topic] = (weakTopics[topic] ?? 0) + 1;
      });

      return {
        ...current,
        quizScores: {
          ...current.quizScores,
          [scopeId]: {
            score: result.score,
            total: result.total,
            date: new Date().toISOString(),
          },
        },
        weakTopics,
      };
    });
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, [setProgress]);

  return {
    progress,
    summary,
    markChapterComplete,
    rememberChapter,
    saveQuizScore,
    resetProgress,
  };
}
