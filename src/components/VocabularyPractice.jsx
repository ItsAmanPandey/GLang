import { CheckCircle2, Layers3, ListChecks, PencilLine, RotateCcw, Volume2, Turtle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTTS } from "../hooks/useTTS.js";
import {
  buildVocabularyMcq,
  hasArticleAndPlural,
  isCorrectAnswer,
  levenshteinDistance,
  spellingTarget,
  stripArticle,
} from "../utils/practice.js";
import { useKeyboardNav } from "../hooks/useKeyboardNav.js";
import { useGrammarRef } from "./GrammarRefDrawer.jsx";

const modes = [
  { id: "cards", label: "Cards", icon: Layers3 },
  { id: "typing", label: "Typing", icon: PencilLine },
  { id: "mcq", label: "Choice", icon: ListChecks },
  { id: "articlePlural", label: "Article + Plural", icon: ListChecks },
  { id: "spelling", label: "Spelling Bee", icon: PencilLine },
];

const articles = ["der", "die", "das"];

export default function VocabularyPractice({ chapter }) {
  const [mode, setMode] = useState("cards");
  const [index, setIndex] = useState(0);
  const [nounIndex, setNounIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState("");
  const [articleGuess, setArticleGuess] = useState("");
  const [pluralGuess, setPluralGuess] = useState("");
  const [feedback, setFeedback] = useState(null);
  const { speak, speakSlow } = useTTS();
  const { openRef } = useGrammarRef();

  const item = chapter.vocabulary[index % chapter.vocabulary.length];
  const nounItems = useMemo(() => chapter.vocabulary.filter(hasArticleAndPlural), [chapter.vocabulary]);
  const nounItem = nounItems[nounIndex % Math.max(nounItems.length, 1)];
  const mcq = useMemo(() => buildVocabularyMcq(item, chapter.vocabulary), [chapter.vocabulary, item]);
  const target = spellingTarget(item);
  const spellingDistance = feedback?.kind === "spelling" ? levenshteinDistance(answer, target) : 0;

  function resetAnswers() {
    setFlipped(false);
    setAnswer("");
    setArticleGuess("");
    setPluralGuess("");
    setFeedback(null);
  }

  function nextCard() {
    if (mode === "articlePlural" && nounItems.length) {
      setNounIndex((current) => (current + 1) % nounItems.length);
    } else {
      setIndex((current) => (current + 1) % chapter.vocabulary.length);
    }

    resetAnswers();
  }

  function checkTypedAnswer() {
    const isCorrect = isCorrectAnswer(answer, item.word);
    setFeedback(isCorrect ? "correct" : "review");
  }

  function chooseOption(option) {
    setAnswer(option);
    const isCorrect = isCorrectAnswer(option, item.word);
    setFeedback(isCorrect ? "correct" : "review");
  }

  function checkArticlePlural() {
    const articleCorrect = isCorrectAnswer(articleGuess, nounItem.article);
    const pluralCorrect = isCorrectAnswer(pluralGuess, nounItem.plural) || isCorrectAnswer(pluralGuess, stripArticle(nounItem.plural));
    const allCorrect = articleCorrect && pluralCorrect;
    setFeedback({
      kind: "articlePlural",
      articleCorrect,
      pluralCorrect,
    });
  }

  function checkSpelling() {
    const isCorrect = isCorrectAnswer(answer, target);
    setFeedback(isCorrect ? "correct" : { kind: "spelling" });
  }

  useKeyboardNav({
    onNumber: (num) => {
      if (mode === "mcq" && num >= 1 && num <= mcq.options.length) {
        chooseOption(mcq.options[num - 1]);
      } else if (mode === "articlePlural" && num >= 1 && num <= articles.length) {
        setArticleGuess(articles[num - 1]);
      }
    },
    onEnter: () => {
      if (mode === "typing") checkTypedAnswer();
      else if (mode === "spelling") checkSpelling();
      else if (mode === "articlePlural") checkArticlePlural();
      else nextCard();
    },
    onSpace: () => {
      if (mode === "cards") setFlipped((current) => !current);
      else speak(item.word);
    }
  });

  return (
    <section className="min-h-[520px] space-y-5">
      <div className="flex flex-wrap gap-2">
        {modes.map((practiceMode) => {
          const Icon = practiceMode.icon;
          return (
            <button
              key={practiceMode.id}
              type="button"
              onClick={() => {
                setMode(practiceMode.id);
                resetAnswers();
              }}
              className={`inline-flex h-12 min-w-[132px] items-center justify-center gap-2 border px-4 text-sm font-semibold rounded-lg transition-colors ${
                mode === practiceMode.id 
                  ? "border-marigold bg-marigold text-white shadow-md" 
                  : "border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-marigold/10 hover:text-marigold"
              }`}
            >
              <Icon size={16} />
              {practiceMode.label}
            </button>
          );
        })}
      </div>

      {mode === "cards" && (
        <div className="w-full max-w-3xl">
          <button
            type="button"
            onClick={() => setFlipped((current) => !current)}
            className="h-72 w-full perspective-1000"
            title="Flip card"
          >
            <div className={`card-flip relative h-full w-full ${flipped ? "is-flipped" : ""}`}>
              <div className="card-face absolute inset-0 grid place-items-center glass-panel p-8">
                <div className="text-center relative w-full">
                  <p className="text-sm uppercase tracking-wide opacity-50 font-semibold">German</p>
                  <p className="mt-3 text-4xl font-bold">{item.word}</p>
                  {item.article && <p className="mt-3 text-lg font-semibold text-marigold">{item.article}</p>}
                  <div className="absolute top-0 right-0 flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); speakSlow(item.word); }}
                      className="p-3 rounded-full hover:bg-[var(--border-color)] text-marigold transition-colors"
                      aria-label="Listen slowly"
                    >
                      <Turtle size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); speak(item.word); }}
                      className="p-3 rounded-full hover:bg-[var(--border-color)] text-marigold transition-colors"
                      aria-label="Listen"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-face card-back absolute inset-0 grid place-items-center glass-panel p-8 bg-[var(--border-color)]">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide opacity-50 font-semibold">English</p>
                  <p className="mt-3 text-3xl font-bold text-marigold">{item.meaning}</p>
                  <p className="mt-5 opacity-70 italic">"{item.example}"</p>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {mode === "typing" && (
        <div className="w-full max-w-3xl min-h-[320px] glass-panel p-6">
          <p className="text-sm uppercase tracking-wide opacity-50 font-semibold">English</p>
          <p className="mt-2 text-2xl font-bold text-marigold">{item.meaning}</p>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-6 w-full rounded-lg border border-[var(--border-color)] bg-transparent px-4 py-3 focus:ring-2 focus:ring-marigold focus:border-marigold"
            placeholder="Type the German translation"
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="button" onClick={checkTypedAnswer} className="inline-flex items-center gap-2 rounded-lg bg-marigold hover:bg-marigold/80 transition-colors px-6 py-2.5 font-semibold text-white shadow-md">
              <CheckCircle2 size={18} />
              Check
            </button>
            <Feedback status={feedback} answer={item.word} />
            {feedback === "review" && item.grammarRef && (
              <button 
                type="button" 
                onClick={() => openRef(item.grammarRef)} 
                className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Review this concept →
              </button>
            )}
          </div>
        </div>
      )}

      {mode === "mcq" && (
        <div className="w-full max-w-3xl min-h-[320px] glass-panel p-6">
          <p className="text-xl font-bold">{mcq.prompt}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {mcq.options.map((option, i) => (
              <button
                key={option}
                type="button"
                onClick={() => chooseOption(option)}
                className={`rounded-lg border px-4 py-4 text-left font-medium transition-all flex items-center gap-3 ${
                  answer === option 
                    ? "border-marigold bg-marigold text-white shadow-md" 
                    : "border-[var(--border-color)] bg-[var(--surface-color)] hover:border-marigold/50 hover:bg-[var(--border-color)]"
                }`}
              >
                <span className="opacity-50 text-sm font-bold bg-ink/10 px-2 py-0.5 rounded">{i + 1}</span>
                {option}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <Feedback status={feedback} answer={item.word} />
            {feedback === "review" && item.grammarRef && (
              <button 
                type="button" 
                onClick={() => openRef(item.grammarRef)} 
                className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Review this concept →
              </button>
            )}
          </div>
        </div>
      )}

      {mode === "articlePlural" && (
        <div className="w-full max-w-3xl min-h-[320px] border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft">
          {nounItem ? (
            <>
              <p className="text-sm uppercase tracking-wide text-ink/50">Guess article and plural</p>
              <h3 className="mt-2 text-3xl font-bold">{stripArticle(nounItem.word)}</h3>
              <p className="mt-1 text-marigold">{nounItem.meaning}</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-ink/60">Article</p>
                  <div className="mt-2 flex gap-2">
                    {articles.map((article) => (
                      <button
                        key={article}
                        type="button"
                        onClick={() => setArticleGuess(article)}
                        className={`border px-4 py-2 font-bold ${
                          articleGuess === article ? "border-marigold bg-marigold text-white" : "border-ink/10 bg-[var(--surface-color)]"
                        }`}
                      >
                        {article}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-ink/60">
                  Plural
                  <input
                    value={pluralGuess}
                    onChange={(event) => setPluralGuess(event.target.value)}
                    className="border border-ink/15 bg-[var(--surface-color)] px-3 py-3 text-base font-normal text-ink"
                    placeholder="die ..."
                  />
                </label>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={checkArticlePlural} className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-semibold text-[var(--bg-color)]">
                  <CheckCircle2 size={18} />
                  Check
                </button>
                <ArticlePluralFeedback feedback={feedback} item={nounItem} />
                {(feedback?.articleCorrect === false || feedback?.pluralCorrect === false) && nounItem.grammarRef && (
                  <button 
                    type="button" 
                    onClick={() => openRef(nounItem.grammarRef)} 
                    className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Review this concept →
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-ink/60">This chapter does not have article and plural data yet.</p>
          )}
        </div>
      )}

      {mode === "spelling" && (
        <div className="w-full max-w-3xl min-h-[320px] border border-ink/10 bg-[var(--surface-color)] p-5 shadow-soft">
          <p className="text-sm uppercase tracking-wide text-ink/50">Spelling Bee</p>
          <p className="mt-2 text-2xl font-bold">{item.meaning}</p>
          <p className="mt-3 text-sm text-ink/60">
            Letters: {target.replace(/\s/g, "").length}
            {target.includes(" ") ? " plus a space" : ""}
          </p>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-5 w-full border border-ink/15 bg-[var(--surface-color)] px-3 py-3"
            placeholder="Spell the German word"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={checkSpelling} className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-semibold text-[var(--bg-color)]">
              <CheckCircle2 size={18} />
              Check
            </button>
            {feedback?.kind === "spelling" ? (
              <span className="font-semibold text-coral">
                {spellingDistance} letter{spellingDistance === 1 ? "" : "s"} off: {target}
              </span>
            ) : (
              <Feedback status={feedback} answer={target} />
            )}
            {(feedback?.kind === "spelling" || feedback === "review") && item.grammarRef && (
              <button 
                type="button" 
                onClick={() => openRef(item.grammarRef)} 
                className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Review this concept →
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={nextCard}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-6 py-2.5 font-semibold shadow-sm hover:bg-[var(--border-color)] transition-colors"
      >
        <RotateCcw size={18} />
        Next
      </button>
    </section>
  );
}

function Feedback({ status, answer }) {
  if (!status || typeof status === "object") return null;

  return (
    <span className={status === "correct" ? "font-semibold text-marigold" : "font-semibold text-coral"}>
      {status === "correct" ? "Correct" : `Review: ${answer}`}
    </span>
  );
}

function ArticlePluralFeedback({ feedback, item }) {
  if (!feedback || feedback.kind !== "articlePlural") return null;

  const allCorrect = feedback.articleCorrect && feedback.pluralCorrect;
  if (allCorrect) return <span className="font-semibold text-marigold">Correct</span>;

  return (
    <span className="font-semibold text-coral">
      Review: {item.article} {stripArticle(item.word)}, {item.plural}
    </span>
  );
}
