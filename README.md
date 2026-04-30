# G Lang -- German Language Learning App

A browser-based German (A1) learning application I developed as a personal study tool alongside my German language course at Hochschule Fulda. The project provides an interactive, offline-first way to practice vocabulary, grammar, and listening skills through structured chapters and gamified exercises.

All vocabulary, grammar explanations, example sentences, and exercises in this project were composed independently. The exercises and examples were generated with the help of AI tools and then reviewed for accuracy. If you notice any errors or awkward phrasing in a chapter, you can update the corresponding JSON file directly under `public/content/A1/`.

---

## Features

- 24 A1-level chapters, each containing 50+ vocabulary words with articles, plurals, and example sentences
- Grammar explanations with worked examples
- Five interactive practice modes per chapter:
  - Fill-in-the-blank
  - Multiple choice
  - Sentence ordering
- Five game types:
  - Memory Match (flip cards to match German words with English meanings)
  - Sentence Builder (drag tokens into the correct order)
  - Quick Fire (timed vocabulary recall)
  - Spelling Bee (listen via browser TTS, then type what you hear)
  - Drag and Drop (match articles or translations)
- Chapter-level quizzes with scoring
- Cross-chapter Practice Hub and cumulative Test mode
- Dark mode with automatic system preference detection
- Fully offline -- all content is stored as local JSON; no server or API required
- Progress saved in the browser (localStorage)

---

## Chapter Overview

| #  | Title                      | Topic                                              |
|----|----------------------------|-----------------------------------------------------|
| 1  | Erste Kontakte             | Greetings, Introductions, and Origins               |
| 2  | Menschen und Berufe        | Personal Details and Occupations                    |
| 3  | Essen und Trinken          | Food, Groceries, and Prices                         |
| 4  | Mein Tag                   | Time, Daily Routine, and Separable Verbs            |
| 5  | Freizeit und Hobbys        | Free Time, Hobbies, and the Verb 'koennen'          |
| 6  | Sonne, Regen und Reisen    | Weather Expressions and Travel Vocabulary           |
| 7  | Mode und Einkaufen         | Clothing, Colors, and Shopping Conversations        |
| 8  | Beim Arzt                  | Body Parts, Illness, and Health Advice              |
| 9  | Zuhause einrichten         | Rooms, Furniture, and Describing Locations           |
| 10 | Unterwegs in der Stadt     | City Places, Directions, and Local Transport        |
| 11 | Arbeit und Alltag          | Professions, Workplace, and Daily Working Life      |
| 12 | Termine und Zeitangaben    | Appointments, Calendar, and Time Prepositions       |
| 13 | Den Weg finden             | Giving Directions, Public Transport, and Navigation |
| 14 | Eine Wohnung finden        | Housing Search, Rent, and Furnishing a Home         |
| 15 | Was hast du gemacht?       | Free Time Activities and the Past Tense (Perfekt)   |
| 16 | Feiern und Traditionen     | Festivals, Holidays, and German Customs             |
| 17 | Digital und vernetzt       | Media, Internet, and Modern Communication           |
| 18 | Wie fuehlt ihr euch?       | Emotions, Relationships, and Describing People      |
| 19 | Natur erleben              | Nature, Animals, and Environmental Awareness        |
| 20 | Ziele und Wuensche         | Future Plans, Wishes, and the Verb 'werden'         |
| 21 | Im Restaurant              | Ordering Food, Paying, and Polite Requests          |
| 22 | Unterwegs im Urlaub        | Travel Planning, Hotels, and Comparisons            |
| 23 | Gesund leben               | Health, Fitness, Nutrition, and Giving Advice       |
| 24 | Alles wiederholen          | Comprehensive Review of A1 Grammar and Vocabulary   |

---

## Tech Stack

- **Vite** -- build tool and development server
- **React 18** -- component-based UI
- **Tailwind CSS** -- utility-first styling with a custom color theme
- **Lucide React** -- icon library
- **Web Speech API** -- browser-native text-to-speech for pronunciation and the Spelling Bee game (no external API keys needed)

---

## Getting Started

### Prerequisites

- **Node.js** version 18 or later (check with `node -v`)
- **npm** (ships with Node.js)

### Installation

1. Clone the repository:

       git clone https://github.com/ItsAmanPandey/GLang.git
       cd G_Lang

2. Install dependencies:

       npm install

3. Start the development server:

       npm run dev

4. Open the URL printed in the terminal (usually `http://localhost:5173`) in your browser.

### Production Build

To create an optimized production bundle:

    npm run build

The output will be in the `dist/` folder. You can serve it with any static file server, for example:

    npx serve dist

---

## Project Structure

    G_lang/
      public/
        content/
          A1/
            chapter1.json    # Chapter data (vocab, grammar, quiz, practice, games)
            chapter2.json
            ...
            chapter24.json
        favicon.svg
      src/
        components/          # React UI components
        data/                # Level configuration
        hooks/               # Custom React hooks (TTS, etc.)
        utils/               # Shared helper functions
        App.jsx              # Main application shell
        main.jsx             # Entry point
        styles.css           # Global CSS variables and base styles
      index.html
      tailwind.config.cjs
      vite.config.js
      package.json

---

## Editing Chapter Content

Each chapter lives in a single JSON file at `public/content/A1/chapterN.json`. The schema looks like this:

    {
      "id": "A1_Ch1",
      "level": "A1",
      "number": 1,
      "title": "Erste Kontakte",
      "subtitle": "Greetings, Introductions, and Origins",
      "focus": ["Greetings", "Introductions"],
      "vocabulary": [
        {
          "word": "Hallo",
          "meaning": "hello",
          "article": null,
          "plural": null,
          "example": "Hallo, wie geht es dir?"
        }
      ],
      "grammar": [
        {
          "topic": "The verb 'sein'",
          "explanation": "...",
          "examples": ["Ich bin Peter.", "Du bist nett."]
        }
      ],
      "practice": [
        { "id": "c1-fill-1", "type": "fill_blank", "prompt": "Ich ___ Peter.", "answer": "bin", "hint": "I am", "topic": "sein" },
        { "id": "c1-choice-1", "type": "choice", "prompt": "What does 'Hallo' mean?", "options": ["hello","bye","thanks","please"], "answer": "hello", "topic": "greetings" },
        { "id": "c1-sent-1", "type": "sentence_order", "prompt": "Arrange: I am Peter.", "tokens": ["Ich","bin","Peter."], "answer": ["Ich","bin","Peter."], "topic": "sein" }
      ],
      "quiz": [
        { "id": "c1-quiz-1", "type": "mcq", "prompt": "...", "options": [...], "answer": "...", "topic": "..." },
        { "id": "c1-quiz-2", "type": "fill_blank", "prompt": "...", "answer": "...", "topic": "..." }
      ],
      "games": [
        { "id": "c1-sentence-1", "type": "sentence_builder", "prompt": "Good morning.", "tokens": ["Guten","Morgen."], "answer": ["Guten","Morgen."] }
      ]
    }

To fix a mistake or add new content, edit the corresponding JSON file and refresh the browser. No rebuild is needed during development.

---

## Disclaimer

This project was built for personal educational use. All vocabulary, grammar rules, example sentences, and exercises were composed independently and do not reproduce copyrighted textbook material. Many of the exercises and example sentences were generated with the help of AI tools and may contain occasional errors. Contributions and corrections are welcome.

---

## License

This project is provided as-is for personal and educational use.
