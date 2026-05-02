export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function normalizeAnswer(value) {
  return String(value)
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/[.!?]+$/g, "");
}

export function isCorrectAnswer(userAnswer, answer) {
  if (Array.isArray(answer)) {
    return answer.some((acceptedAnswer) => isCorrectAnswer(userAnswer, acceptedAnswer));
  }

  return normalizeAnswer(userAnswer) === normalizeAnswer(answer);
}

export function stripArticle(word) {
  return String(word).replace(/^(der|die|das)\s+/i, "");
}

export function hasArticleAndPlural(item) {
  return Boolean(item.article && item.plural && !["-", "—", "(Sg.)", "(Pl.)"].includes(item.plural));
}

export function spellingTarget(item) {
  return hasArticleAndPlural(item) ? stripArticle(item.word) : item.word;
}

export function levenshteinDistance(a, b) {
  const left = normalizeAnswer(a);
  const right = normalizeAnswer(b);
  const matrix = Array.from({ length: left.length + 1 }, (_, row) => [row]);

  for (let column = 1; column <= right.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return matrix[left.length][right.length];
}

export function buildVocabularyMcq(vocabularyItem, pool) {
  const wrongOptions = shuffle(
    pool
      .filter((item) => item.word !== vocabularyItem.word)
      .map((item) => item.word)
  ).slice(0, 3);

  return {
    id: `vocab-${vocabularyItem.word}`,
    type: "mcq",
    prompt: `Choose the German for "${vocabularyItem.meaning}".`,
    options: shuffle([vocabularyItem.word, ...wrongOptions]),
    answer: vocabularyItem.word,
    topic: "vocabulary",
  };
}

export function buildTestQuestions(chapters) {
  const vocabularyChapters = chapters.filter((chapter) => Array.isArray(chapter.vocabulary));
  const vocabularyPool = vocabularyChapters.flatMap((chapter) => chapter.vocabulary);
  const vocabularyQuestions = vocabularyChapters.flatMap((chapter) =>
    shuffle(chapter.vocabulary).slice(0, 6).map((item) => ({
      ...buildVocabularyMcq(item, vocabularyPool),
      id: `${chapter.id}-${item.word}`,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    }))
  );
  const articleQuestions = vocabularyChapters.flatMap((chapter) =>
    shuffle(chapter.vocabulary.filter(hasArticleAndPlural)).slice(0, 6).flatMap((item) => [
      {
        id: `${chapter.id}-${item.word}-article`,
        type: "mcq",
        prompt: `Choose the article for "${stripArticle(item.word)}".`,
        options: ["der", "die", "das"],
        answer: item.article,
        topic: "article",
        chapterId: chapter.id,
        chapterTitle: chapter.title,
      },
      {
        id: `${chapter.id}-${item.word}-plural`,
        type: "fill_blank",
        prompt: `Write the plural of "${item.word}".`,
        answer: [item.plural, stripArticle(item.plural)],
        topic: "plural",
        chapterId: chapter.id,
        chapterTitle: chapter.title,
      },
    ])
  );

  const quizQuestions = chapters.flatMap((chapter) =>
    (chapter.quiz ?? []).map((question) => ({
      ...question,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    }))
  );

  return shuffle([...vocabularyQuestions, ...articleQuestions, ...quizQuestions]).slice(0, 28);
}

export function scoreAnswers(questions, answers) {
  const checked = questions.map((question) => {
    const answer = answers[question.id] ?? "";
    const correct = isCorrectAnswer(answer, question.answer);
    return { ...question, userAnswer: answer, correct };
  });

  const weakTopics = [
    ...new Set(
      checked
        .filter((question) => !question.correct)
        .map((question) => question.topic ?? "practice")
    ),
  ];

  return {
    checked,
    score: checked.filter((question) => question.correct).length,
    total: checked.length,
    weakTopics,
  };
}
