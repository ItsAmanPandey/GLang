export async function loadChapters(level = "A1") {
  const basePath = `/content/${level}`;
  const indexResponse = await fetch(`${basePath}/index.json`);

  if (!indexResponse.ok) {
    throw new Error(`Could not load ${level} content index.`);
  }

  const index = await indexResponse.json();
  const chapters = await Promise.all(
    index.chapters.map(async (chapter) => {
      const response = await fetch(`${basePath}/${chapter.file}`);

      if (!response.ok) {
        throw new Error(`Could not load ${chapter.file}.`);
      }

      return response.json();
    })
  );

  return chapters.sort((a, b) => {
    const isAGrammar = a.type === "grammarFocus";
    const isBGrammar = b.type === "grammarFocus";
    if (isAGrammar && !isBGrammar) return 1;
    if (!isAGrammar && isBGrammar) return -1;
    if (isAGrammar && isBGrammar) {
      return parseInt(a.number.replace("GF", "")) - parseInt(b.number.replace("GF", ""));
    }
    return a.number - b.number;
  });
}
