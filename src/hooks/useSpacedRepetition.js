import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "glang_srs_";
const LEGACY_STORAGE_KEY = "glang_srs_data";
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const START_EASE = 2.5;
const CHANGE_EVENT = "glang-srs-change";

export function useSpacedRepetition() {
  const [srsData, setSrsData] = useState({});

  useEffect(() => {
    setSrsData(loadSrsData());
    const sync = () => setSrsData(loadSrsData());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const getDueItems = useCallback((content) => {
    const now = Date.now();
    return flattenContent(content)
      .filter((item) => {
        const id = getItemId(item);
        if (!id) return false;
        const record = srsData[id];
        if (!record) return true;
        return record.dueDate <= now;
      })
      .sort((a, b) => {
        const aRecord = srsData[getItemId(a)];
        const bRecord = srsData[getItemId(b)];
        const aDue = aRecord?.dueDate ?? 0;
        const bDue = bRecord?.dueDate ?? 0;
        return aDue - bDue;
      });
  }, [srsData]);

  const recordAnswer = useCallback((wordId, isCorrect) => {
    if (!wordId) return;

    setSrsData((prevData) => {
      const current = prevData[wordId] ?? {
        wordId,
        lastSeen: null,
        interval: 1,
        easeFactor: START_EASE,
        dueDate: 0,
      };

      const easeFactor = isCorrect
        ? Math.min(MAX_EASE, current.easeFactor + 0.1)
        : Math.max(MIN_EASE, current.easeFactor - 0.2);
      const interval = isCorrect
        ? Math.max(1, Math.round(current.interval * current.easeFactor))
        : 1;
      const now = Date.now();
      const nextRecord = {
        wordId,
        lastSeen: now,
        interval,
        easeFactor,
        dueDate: now + interval * DAY_MS,
      };

      persistRecord(nextRecord);
      return {
        ...prevData,
        [wordId]: nextRecord,
      };
    });
  }, []);

  const getChapterMastery = useCallback((chapter) => {
    const items = chapter.type === "grammarFocus" ? chapter.practice : chapter.vocabulary;
    if (!items?.length) return 0;

    const easeSum = items.reduce((sum, item) => {
      const record = srsData[getItemId(item)];
      return sum + (record?.easeFactor ?? MIN_EASE);
    }, 0);
    const raw = ((easeSum - MIN_EASE * items.length) / (1.7 * items.length)) * 100;
    return Math.round(Math.max(0, Math.min(100, raw)));
  }, [srsData]);

  return { srsData, getDueItems, recordAnswer, submitReview: recordAnswer, getChapterMastery };
}

function loadSrsData() {
  if (typeof localStorage === "undefined") return {};

  const records = {};

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX) || key === LEGACY_STORAGE_KEY) continue;

    try {
      const record = normalizeRecord(JSON.parse(localStorage.getItem(key)));
      if (record?.wordId) records[record.wordId] = record;
    } catch (error) {
      console.error(`Failed to parse ${key}`, error);
    }
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      Object.entries(parsed).forEach(([wordId, record]) => {
        if (!records[wordId]) {
          const normalized = normalizeRecord({ wordId, ...record });
          if (normalized) {
            records[wordId] = normalized;
            persistRecord(normalized);
          }
        }
      });
    } catch (error) {
      console.error("Failed to parse legacy SRS data", error);
    }
  }

  return records;
}

function normalizeRecord(record) {
  if (!record) return null;

  const wordId = record.wordId;
  if (!wordId) return null;

  return {
    wordId,
    lastSeen: record.lastSeen ?? record.lastReviewed ?? null,
    interval: Number(record.interval) || 1,
    easeFactor: Math.max(MIN_EASE, Math.min(MAX_EASE, Number(record.easeFactor ?? record.ease ?? START_EASE))),
    dueDate: Number(record.dueDate ?? record.nextReview ?? 0),
  };
}

function persistRecord(record) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${record.wordId}`, JSON.stringify(record));
  window.queueMicrotask(() => window.dispatchEvent(new Event(CHANGE_EVENT)));
}

function flattenContent(content) {
  if (!Array.isArray(content)) return [];

  const looksLikeChapters = content.some((item) => Array.isArray(item?.vocabulary) || Array.isArray(item?.practice));
  if (!looksLikeChapters) return content;

  return content.flatMap((chapter) => {
    if (chapter.type === "grammarFocus") {
      return (chapter.practice ?? []).map((item) => ({
        ...item,
        _chapterId: chapter.id,
        _chapterTitle: chapter.title,
      }));
    }

    return (chapter.vocabulary ?? []).map((item) => ({
      ...item,
      _chapterId: chapter.id,
      _chapterTitle: chapter.title,
    }));
  });
}

function getItemId(item) {
  return item?.id || item?.word;
}
