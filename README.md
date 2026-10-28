# IC4.0 Data Analysis Reviewer

Interactive revision site for the **Data Analysis in IC4.0 2024/2025 final exam** (UC3M, Master in Connected Industry 4.0).
Built from `Exam_IC40.pdf` and the Topic 1–4 slides. Styled with the **Signal Study** design system in [`DESIGN.md`](DESIGN.md).

## What's inside

- **Dashboard**: progress ring, stats, next-up lessons, revision queue.
- **Exam breakdown**: all 11 exam parts with original wording, marks, model answers and checklists.
- **Lessons** (Topics 1–4): 5-step template with priority badges, exam essentials, confusion callouts and quick checks.
- **Formulas**: 18 typeset formula cards (KaTeX → MathML), variable tables, worked examples from slide numbers, illustrations and practice checks.
- **Flashcards**, **written practice** with rubric feedback, **exam calculators** (Q2(i), Q2(ii), Q4(iii)), **diagram drills** with a sketch pad, and a **mock exam** with timer, flags and review.
- Progress is stored in `localStorage` per browser, with an export/import code on the *Revision & progress* page.

## Project structure

```
index.html              App shell
assets/styles.css       Signal Study tokens + components
assets/data.js          Exam questions, lessons, flashcards, diagrams
assets/formulas.js      Generated: formula cards with pre-rendered MathML
assets/app.js           Views, routing, grading, calculators, drawing pad
content/formulas.src.mjs  Formula source (TeX)
scripts/build.mjs       Renders formulas.src.mjs → assets/formulas.js
DESIGN.md               Design system
```

No framework and no runtime dependencies. `assets/formulas.js` is committed, so the site deploys as plain static files.

## Run locally

```bash
python3 -m http.server 8000      # or: npm run dev
# open http://localhost:8000
```

## Edit formulas

```bash
npm install          # installs KaTeX (dev only)
# edit content/formulas.src.mjs
npm run build        # regenerates assets/formulas.js
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project → Import** the repo.
3. Framework preset **Other**, leave Build Command empty, Output Directory `.` (already set in `vercel.json`).
4. Deploy. Every push to `main` redeploys.

Or from the CLI: `npx vercel --prod`.

## Limitations

- The exam's Figures 1–6 are images and were not readable from the source text, so their numbers are not built in. The calculators take them as input.
- Slide images could not be extracted. Illustrations are redrawn from slide text, computed from slide formulas/numbers, or original schematics, and each is labelled.
- Answer checking is keyword-based and is an estimate, not the lecturer's marking.
- Progress does not sync between devices unless you use the export/import code.
