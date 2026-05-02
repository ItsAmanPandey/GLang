import { Clock3, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildVocabularyMcq, isCorrectAnswer, shuffle, stripArticle } from "../utils/practice.js";
import { useTTS } from "../hooks/useTTS.js";
import ArticleBattle from "./games/ArticleBattle.jsx";
import ErrorDetective from "./games/ErrorDetective.jsx";
import ConjugationGrid from "./games/ConjugationGrid.jsx";
import SituationChooser from "./games/SituationChooser.jsx";
import PrepositionSorter from "./games/PrepositionSorter.jsx";
import TimelineStory from "./games/TimelineStory.jsx";

const SEIN_VERBS = new Set([
  "gehen", "fahren", "kommen", "fliegen", "laufen", "reisen", "schwimmen", "aufwachen", "einschlafen", "bleiben",
  "werden", "passieren", "ankommen", "abfahren", "einsteigen", "aussteigen", "umsteigen", "fallen", "sterben", "sein",
]);

const EXTRA_VERBS = [
  "machen", "kaufen", "lernen", "spielen", "kochen", "schreiben", "lesen", "essen", "trinken", "sehen", "hören",
  "arbeiten", "wohnen", "leben", "lieben", "suchen", "finden", "fragen", "antworten", "tanzen", "singen", "telefonieren",
  "besuchen", "bezahlen", "bestellen", "öffnen", "schließen", "putzen", "duschen", "frühstücken", "aufstehen", "einkaufen",
  "fernsehen", "mitkommen", "anrufen", "ankommen", "abfahren", "einsteigen", "aussteigen", "umsteigen",
];

const CASE_SORTER_ITEMS = [
  { word: "durch", correctBucket: "akkusativ" },
  { word: "für", correctBucket: "akkusativ" },
  { word: "gegen", correctBucket: "akkusativ" },
  { word: "ohne", correctBucket: "akkusativ" },
  { word: "um", correctBucket: "akkusativ" },
  { word: "bis", correctBucket: "akkusativ" },
  { word: "entlang", correctBucket: "akkusativ" },
  { word: "mit", correctBucket: "dativ" },
  { word: "aus", correctBucket: "dativ" },
  { word: "bei", correctBucket: "dativ" },
  { word: "nach", correctBucket: "dativ" },
  { word: "seit", correctBucket: "dativ" },
  { word: "von", correctBucket: "dativ" },
  { word: "zu", correctBucket: "dativ" },
  { word: "gegenüber", correctBucket: "dativ" },
];

export default function GamesPanel({ chapter, chapters = [] }) {
  if (chapter.type === "grammarFocus") {
    const vocabulary = chapters.flatMap((item) => item.vocabulary ?? []);
    return (
      <section className="grid gap-5 xl:grid-cols-2">
        {chapter.games.map((game, i) => {
          const key = game.id || i;
          const expandedGame = expandGrammarGame(game, vocabulary);
          if (game.type === "article_battle") return <ArticleBattle key={key} gameData={expandedGame} />;
          if (game.type === "error_detective") return <ErrorDetective key={key} gameData={expandedGame} />;
          if (game.type === "conjugation_grid") return <ConjugationGrid key={key} gameData={game} />;
          if (game.type === "situation_chooser") return <SituationChooser key={key} gameData={game} />;
          if (game.type === "preposition_sorter") return <PrepositionSorter key={key} gameData={expandedGame} />;
          if (game.type === "haben_sein_sorter") return <PrepositionSorter key={key} gameData={expandedGame} />;
          if (game.type === "timeline_story") return <TimelineStory key={key} gameData={game} />;
          if (game.type === "sentence_builder") return <SentenceBuilder key={key} games={game.sentences || [game]} theme="grammar" />;
          return null;
        })}
      </section>
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <MemoryMatch vocabulary={chapter.vocabulary} />
      <SentenceBuilder games={chapter.games} />
      <SpellingBee vocabulary={chapter.vocabulary} />
      <DragDropPractice vocabulary={chapter.vocabulary} />
      <QuickFire vocabulary={chapter.vocabulary} />
    </section>
  );
}

function expandGrammarGame(game, vocabulary) {
  if (game.type === "article_battle") {
    const generated = vocabulary
      .filter((item) => item.article && ["der", "die", "das"].includes(item.article))
      .map((item, index) => ({
        id: `book-article-${index}`,
        noun: stripArticle(item.word),
        article: articleForMode(item.article, game.mode),
        mode: game.mode,
      }));

    return {
      ...game,
      items: [...generated, ...(game.items ?? [])],
    };
  }

  if (game.type === "preposition_sorter" || game.type === "haben_sein_sorter") {
    const bucketIds = new Set((game.buckets ?? []).map((bucket) => bucket.id));
    const generated = bucketIds.has("haben") && bucketIds.has("sein")
      ? buildHabenSeinItems(vocabulary)
      : bucketIds.has("akkusativ") && bucketIds.has("dativ")
      ? CASE_SORTER_ITEMS.map((item, index) => ({ id: `case-${index}`, ...item }))
      : [];

    return {
      ...game,
      items: [...generated, ...(game.items ?? [])],
    };
  }

  return game;
}

function buildHabenSeinItems(vocabulary) {
  const verbsFromContent = vocabulary
    .filter((item) => !item.article && /(^to\s|\/ to |can \/ to|would like)/i.test(item.meaning ?? ""))
    .map((item) => item.word);
  const verbs = [...new Set([...verbsFromContent, ...EXTRA_VERBS])];

  return verbs.map((word, index) => ({
    id: `aux-${index}`,
    word,
    correctBucket: SEIN_VERBS.has(word) ? "sein" : "haben",
  }));
}

function articleForMode(article, mode) {
  if (mode === "akkusativ") {
    if (article === "der") return "den";
    return article;
  }
  if (mode === "dativ") {
    if (article === "die") return "der";
    return "dem";
  }
  return article;
}

function MemoryMatch({ vocabulary }) {
  const [pairs, setPairs] = useState(() => shuffle(vocabulary).slice(0, 6));
  const [cards, setCards] = useState(() => makeMemoryCards(pairs));
  const [openIds, setOpenIds] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    const nextPairs = shuffle(vocabulary).slice(0, 6);
    setPairs(nextPairs);
    setCards(makeMemoryCards(nextPairs));
    setOpenIds([]);
    setMatched([]);
  }, [vocabulary]);

  useEffect(() => {
    if (openIds.length !== 2) return;

    const [first, second] = openIds.map((id) => cards.find((card) => card.id === id));
    const isMatch = first.pairId === second.pairId && first.kind !== second.kind;

    const timer = window.setTimeout(() => {
      if (isMatch) {
        setMatched((current) => [...current, first.pairId]);
      }
      setOpenIds([]);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [cards, openIds]);

  function reset() {
    const nextPairs = shuffle(vocabulary).slice(0, 6);
    setPairs(nextPairs);
    setCards(makeMemoryCards(nextPairs));
    setOpenIds([]);
    setMatched([]);
  }

  return (
    <article className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft">
      <GameHeader title="Memory Match" action={reset} />
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cards.map((card) => {
          const visible = openIds.includes(card.id) || matched.includes(card.pairId);
          return (
            <button
              key={card.id}
              type="button"
              disabled={visible || openIds.length === 2}
              onClick={() => setOpenIds((current) => [...current, card.id])}
              className={`h-20 border px-2 text-sm font-semibold transition ${
                visible ? "border-marigold bg-peachglass text-slate-900" : "border-ink/10 bg-ink text-[var(--bg-color)]"
              }`}
            >
              {visible ? card.label : ""}
            </button>
          );
        })}
      </div>
      {matched.length === pairs.length && <p className="mt-4 font-semibold text-marigold">Complete</p>}
    </article>
  );
}

function SentenceBuilder({ games, theme = "vocab" }) {
  const [queue, setQueue] = useState(() => shuffle(games));
  const [index, setIndex] = useState(0);
  const game = queue[index % queue.length];
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const tokens = useMemo(() => shuffle(game.tokens), [game]);
  const isGrammarTheme = theme === "grammar";
  const activeButton = isGrammarTheme ? "bg-purple-600 hover:bg-purple-700" : "bg-ink";
  const chipClass = isGrammarTheme
    ? "border-purple-200 bg-purple-50 text-purple-950 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-100"
    : "border-ink/10 bg-peachglass text-slate-900";
  const correctClass = isGrammarTheme ? "font-semibold text-purple-600 dark:text-purple-400" : "font-semibold text-marigold";

  useEffect(() => {
    setQueue(shuffle(games));
    setIndex(0);
    setSelected([]);
    setFeedback(null);
  }, [games]);

  function reset() {
    setSelected([]);
    setFeedback(null);
  }

  function check() {
    setFeedback(isCorrectAnswer(selected.join(" "), game.answer.join(" ")) ? "correct" : "review");
  }

  function next() {
    setIndex((current) => {
      const nextIndex = current + 1;
      if (nextIndex % queue.length === 0) setQueue(shuffle(games));
      return nextIndex;
    });
    reset();
  }

  return (
    <article className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft">
      <GameHeader title="Sentence Builder" action={reset} />
      <p className="mt-3 text-sm uppercase tracking-wide text-ink/50">{game.prompt}</p>
      <div className="mt-4 min-h-14 border border-dashed border-ink/20 bg-[var(--surface-color)] p-3">{selected.join(" ")}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tokens.map((token, tokenIndex) => (
          <button
            key={`${token}-${tokenIndex}`}
            type="button"
            onClick={() => setSelected((current) => [...current, token])}
            className={`border px-3 py-2 font-semibold ${chipClass}`}
          >
            {token}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={check} className={`${activeButton} px-4 py-2 font-semibold text-white`}>
          Check
        </button>
        <button type="button" onClick={next} className="border border-ink/15 bg-[var(--surface-color)] px-4 py-2 font-semibold">
          Next
        </button>
        {feedback && (
          <span className={feedback === "correct" ? correctClass : "font-semibold text-coral"}>
            {feedback === "correct" ? "Correct" : game.answer.join(" ")}
          </span>
        )}
      </div>
    </article>
  );
}

function QuickFire({ vocabulary }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const [score, setScore] = useState(0);
  const [questionSeed, setQuestionSeed] = useState(0);
  const question = useMemo(() => buildVocabularyMcq(shuffle(vocabulary)[0], vocabulary), [questionSeed, vocabulary]);

  useEffect(() => {
    if (!running || seconds <= 0) return;

    const timer = window.setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds]);

  function start() {
    setRunning(true);
    setSeconds(45);
    setScore(0);
    setQuestionSeed((current) => current + 1);
  }

  function answer(option) {
    if (!running || seconds <= 0) return;
    if (isCorrectAnswer(option, question.answer)) setScore((current) => current + 1);
    setQuestionSeed((current) => current + 1);
  }

  return (
    <article className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft xl:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Quick Fire</h3>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="inline-flex items-center gap-1 text-marigold">
            <Clock3 size={16} />
            {seconds}s
          </span>
          <span className="inline-flex items-center gap-1 text-coral">
            <Trophy size={16} />
            {score}
          </span>
        </div>
      </div>
      <p className="mt-4 text-xl font-semibold">{running && seconds > 0 ? question.prompt : "Ready"}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(running && seconds > 0 ? question.options : ["Start"]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => (running ? answer(option) : start())}
            className="border border-ink/10 bg-[var(--surface-color)] px-3 py-3 text-left font-semibold hover:border-marigold/50"
          >
            {option}
          </button>
        ))}
      </div>
    </article>
  );
}

function GameHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <button type="button" onClick={action} title="Reset" className="border border-ink/10 bg-[var(--surface-color)] p-2">
        <RotateCcw size={18} />
      </button>
    </div>
  );
}

function makeMemoryCards(pairs) {
  return shuffle(
    pairs.flatMap((item, index) => [
      { id: `${index}-word`, pairId: index, kind: "word", label: item.word },
      { id: `${index}-meaning`, pairId: index, kind: "meaning", label: item.meaning },
    ])
  );
}

function SpellingBee({ vocabulary }) {
  const [queue, setQueue] = useState(() => shuffle(vocabulary));
  const [index, setIndex] = useState(0);
  const word = queue[index % queue.length];
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const { speak } = useTTS();

  useEffect(() => {
    setQueue(shuffle(vocabulary));
    setIndex(0);
    setInput("");
    setFeedback(null);
  }, [vocabulary]);

  function reset() {
    setInput("");
    setFeedback(null);
  }

  function check(e) {
    e.preventDefault();
    setFeedback(isCorrectAnswer(input, word.word) ? "correct" : "review");
  }

  function next() {
    setIndex((current) => current + 1);
    reset();
  }

  return (
    <article className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft xl:col-span-2">
      <GameHeader title="Spelling Bee" action={reset} />
      <p className="mt-3 text-sm uppercase tracking-wide text-ink/50">Listen and type the word</p>
      
      <div className="mt-4 flex items-center justify-center min-h-32 border border-dashed border-ink/20 bg-paper/50 p-3 rounded-xl">
        <button 
          onClick={() => speak(word.word)}
          className="p-5 rounded-full bg-marigold text-white shadow-glow hover:scale-105 transition-transform"
        >
          <Volume2 size={40} />
        </button>
      </div>
      
      <form onSubmit={check} className="mt-6 flex flex-col gap-3 max-w-md mx-auto">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type what you hear..."
          className="w-full border border-ink/20 rounded-lg p-3 focus:ring-2 focus:ring-marigold outline-none bg-[var(--surface-color)]"
          autoComplete="off"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="bg-ink px-5 py-2 font-semibold text-[var(--bg-color)] rounded-lg">
            Check
          </button>
          <button type="button" onClick={next} className="border border-ink/15 bg-[var(--surface-color)] px-5 py-2 font-semibold rounded-lg">
            Next
          </button>
          {feedback && (
            <span className={feedback === "correct" ? "font-semibold text-marigold" : "font-semibold text-coral"}>
              {feedback === "correct" ? "Correct!" : word.word}
            </span>
          )}
        </div>
      </form>
    </article>
  );
}

function DragDropPractice({ vocabulary }) {
  const [variation, setVariation] = useState("translation");
  const [pairs, setPairs] = useState([]);
  const [targets, setTargets] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [placements, setPlacements] = useState({});

  useEffect(() => {
    initGame();
  }, [vocabulary]);

  function initGame() {
    // 50% chance to be article matching if there are enough nouns
    const nouns = vocabulary.filter(v => v.article);
    const isArticle = nouns.length >= 3 && Math.random() > 0.5;
    
    setVariation(isArticle ? "article" : "translation");
    setPlacements({});
    
    if (isArticle) {
      const selected = shuffle(nouns).slice(0, 5);
      setPairs(selected);
      setTargets([{ id: 'der', label: 'der' }, { id: 'die', label: 'die' }, { id: 'das', label: 'das' }]);
    } else {
      const selected = shuffle(vocabulary).slice(0, 5);
      setPairs(selected);
      setTargets(shuffle([...selected]).map(v => ({ id: v.word, label: v.word })));
    }
  }

  function handleDragStart(e, id) {
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    const item = pairs.find(p => p.word === sourceId);
    if (!item) return;

    setPlacements(current => ({ ...current, [sourceId]: targetId }));
    setDraggedId(null);
  }

  return (
    <article className="border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft xl:col-span-2">
      <GameHeader title="Drag & Drop" action={initGame} />
      <p className="mt-3 text-sm uppercase tracking-wide text-ink/50">
        {variation === "translation" ? "Match meaning to word" : "Match noun to article"}
      </p>
      
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* Draggables */}
        <div className="flex flex-col gap-3">
          <p className="font-bold border-b border-ink/10 pb-2">
            {variation === "translation" ? "Meanings" : "Nouns"}
          </p>
          <div className="flex flex-wrap gap-2">
            {pairs.map(p => {
               if (placements[p.word]) return null;
               return (
                 <div
                   key={p.word}
                   draggable
                   onDragStart={(e) => handleDragStart(e, p.word)}
                   onDragEnd={() => setDraggedId(null)}
                   className={`px-4 py-3 border border-ink/20 bg-peachglass text-slate-900 font-semibold rounded-lg cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-105 ${draggedId === p.word ? 'opacity-50' : ''}`}
                 >
                   {variation === "translation" ? p.meaning : (variation === "article" ? stripArticle(p.word) : p.word)}
                 </div>
               );
            })}
            {Object.keys(placements).length === pairs.length && <p className="font-semibold text-marigold py-3">Round complete!</p>}
          </div>
        </div>
        
        {/* Drop Targets */}
        <div className="flex flex-col gap-3">
          <p className="font-bold border-b border-ink/10 pb-2">Drop Here</p>
          <div className={`grid gap-3 ${variation === 'article' ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {targets.map(t => {
               return (
                 <div
                   key={t.id}
                   onDrop={(e) => handleDrop(e, t.id)}
                   onDragOver={(e) => e.preventDefault()}
                   className="min-h-16 p-3 border-2 border-dashed border-ink/30 bg-[var(--surface-color)] rounded-xl flex flex-col items-center justify-center font-bold"
                 >
                   <span className="text-ink/40 mb-2">{t.label}</span>
                   {variation === "article" && Object.entries(placements).filter(([id, target]) => target === t.id).map(([id]) => {
                      const p = pairs.find(x => x.word === id);
                      const isCorrect = p.article === t.id;
                      return (
                        <span key={id} className={`block text-xs font-bold px-2 py-0.5 rounded m-0.5 ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 line-through'}`}>
                          {stripArticle(p.word)}
                        </span>
                      );
                   })}
                   {variation === "translation" && Object.entries(placements).filter(([id, target]) => target === t.id).map(([id]) => {
                      const p = pairs.find(x => x.word === id);
                      const isCorrect = id === t.id;
                      return (
                        <span key={id} className={`block text-xs font-bold px-2 py-0.5 rounded m-0.5 ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 line-through'}`}>
                           {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      );
                   })}
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
