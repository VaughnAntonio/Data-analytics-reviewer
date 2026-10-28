# Signal Study — Design System

A design and website format extracted from the **IC4.0 Exam Reviewer**. Use it for study platforms, course reviewers, knowledge bases, learning dashboards and other tools that teach or track progress.

The name comes from the palette: a deep teal **signal** accent for action and progress, cool steel neutrals for long reading sessions, and a safety orange used only for high priority.

---

## 0. How to use this file

Give this file to a designer, developer or AI assistant with the instruction:

> Follow DESIGN.md. Use its tokens instead of literal colors, its components instead of new ones, and its content template for every lesson or article. Deviate only where the project brief says otherwise.

**Precedence:** the project brief → this file → personal taste.

Everything here is plain HTML, CSS and vanilla JS. It works without a framework and ports directly to React, Vue or Tailwind (see §13).

---

## 1. Principles

1. **Understanding over decoration.** Every visual must explain something. No decorative gradients, blobs or stock illustrations.
2. **Summary before detail.** Dashboards lead with progress and the next action. Lessons lead with a plain explanation, then depth.
3. **Never rely on color alone.** Priority badges have shapes (▲ triangle, ● circle, ■ square) and words. Right/wrong answers carry text labels ("Correct", "Your answer").
4. **Two themes from day one.** Every color is a token with a light and a dark value.
5. **Diagrams are HTML first.** Flows, stacks and grids are built from HTML/CSS so they reflow on phones. SVG is for curves, charts and geometry only.
6. **Works at 375 px.** No horizontal page scroll, ever. Tables and wide diagrams scroll inside their own container.
7. **One accent.** Teal means "act here" or "progress". Orange means "high priority". Nothing else competes.
8. **Progress is honest.** Say where data is stored and what it can't do (e.g. "saved in this browser only, does not sync").

---

## 2. Color tokens

Copy this block as-is. Components must reference tokens, never hex values.

```css
/* ---------- Light (default) ---------- */
:root {
  /* Surfaces & text */
  --bg: #f3f6f7;        --surface: #ffffff;   --surface-2: #eaf0f2;  --surface-3: #dfe7ea;
  --fg: #13212b;        --fg-2: #4b5c68;      --fg-3: #6f808b;
  --line: #d5dfe3;      --line-2: #c3d0d6;

  /* Accent (signal teal) */
  --accent: #0d7464;    --accent-2: #0a5c50;  --accent-soft: #d9efe9; --on-accent: #ffffff;

  /* Priority */
  --hi: #b9400c;        --hi-soft: #fde6d8;    /* high   — safety orange */
  --med: #8a5a00;       --med-soft: #f8ecc9;   /* medium — amber */
  --low: #52636f;       --low-soft: #e5ebee;   /* low    — steel */

  /* Semantic */
  --good: #137a3a;      --good-soft: #dcf2e3;
  --bad: #b42318;       --bad-soft: #fbe2df;
  --flag: #8a5a00;

  /* Diagram categorical pairs: fill (cN) + stroke/ink (cNs) */
  --c1: #dcebf7; --c1s: #2f6fa3;   /* blue   */
  --c2: #d8efe9; --c2s: #0d7464;   /* teal   */
  --c3: #e9e4f7; --c3s: #5c4ca8;   /* violet */
  --c4: #f8ecd2; --c4s: #9a6400;   /* amber  */
  --c5: #fbe1dc; --c5s: #b23a28;   /* coral  */
  --c6: #e3eedb; --c6s: #4c7a24;   /* green  */

  --shadow: 0 1px 2px rgba(19,33,43,.06), 0 4px 16px rgba(19,33,43,.06);
}

/* ---------- Dark: OS preference, unless the user forced light ---------- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0e1418;      --surface: #151e24;   --surface-2: #1c272e;  --surface-3: #243139;
    --fg: #e5edf0;      --fg-2: #a3b3bc;      --fg-3: #83949e;
    --line: #2a3841;    --line-2: #36464f;
    --accent: #3cc0a8;  --accent-2: #69d4c0;  --accent-soft: #123a34; --on-accent: #06201b;
    --hi: #ff9a63;      --hi-soft: #3d2216;
    --med: #f0c35e;     --med-soft: #352b12;
    --low: #a9b8c1;     --low-soft: #26323a;
    --good: #5fd28a;    --good-soft: #12301f;
    --bad: #ff8a7e;     --bad-soft: #3a1a17;
    --flag: #f0c35e;
    --c1: #16293a; --c1s: #7fb5e3;  --c2: #123530; --c2s: #3cc0a8;  --c3: #241f3d; --c3s: #a99bef;
    --c4: #33290f; --c4s: #e6b450;  --c5: #3a1d19; --c5s: #ff8f7c;  --c6: #1d2d16; --c6s: #9bd06a;
    --shadow: 0 1px 2px rgba(0,0,0,.3), 0 4px 18px rgba(0,0,0,.25);
    color-scheme: dark;
  }
}

/* ---------- Dark: explicit toggle (same values as above) ---------- */
:root[data-theme="dark"] {
  --bg: #0e1418;      --surface: #151e24;   --surface-2: #1c272e;  --surface-3: #243139;
  --fg: #e5edf0;      --fg-2: #a3b3bc;      --fg-3: #83949e;
  --line: #2a3841;    --line-2: #36464f;
  --accent: #3cc0a8;  --accent-2: #69d4c0;  --accent-soft: #123a34; --on-accent: #06201b;
  --hi: #ff9a63;      --hi-soft: #3d2216;
  --med: #f0c35e;     --med-soft: #352b12;
  --low: #a9b8c1;     --low-soft: #26323a;
  --good: #5fd28a;    --good-soft: #12301f;
  --bad: #ff8a7e;     --bad-soft: #3a1a17;
  --flag: #f0c35e;
  --c1: #16293a; --c1s: #7fb5e3;  --c2: #123530; --c2s: #3cc0a8;  --c3: #241f3d; --c3s: #a99bef;
  --c4: #33290f; --c4s: #e6b450;  --c5: #3a1d19; --c5s: #ff8f7c;  --c6: #1d2d16; --c6s: #9bd06a;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 4px 18px rgba(0,0,0,.25);
  color-scheme: dark;
}

body { background: var(--bg); color: var(--fg); }
```

**Rules**

- The `[data-theme="dark"]` block repeats the dark values so a manual toggle wins in both directions. Never define a token *only* inside a media query or `[data-theme]` block.
- `body` always sets an explicit `background`.
- Dark mode is designed, not inverted: the accent gets lighter (`#3cc0a8`) and text on it gets darker (`--on-accent: #06201b`).
- Neutrals carry a slight blue-green bias toward the accent. Don't swap in pure greys.

### Color roles at a glance

| Token | Use for | Never use for |
|---|---|---|
| `--accent` | Primary buttons, progress fills, current nav item, links, focus ring | Decoration, large backgrounds |
| `--accent-soft` | Selected states, "Exam essentials" callout, icon tiles | Body text background in long passages |
| `--hi` / `--hi-soft` | HIGH priority badge only | Errors (use `--bad`) |
| `--med-soft` | Medium badge, "Common confusion" callout, warning notes | Success |
| `--good` / `--bad` | Correct/incorrect feedback, score states | Priority |
| `--c1`…`--c6` | Diagram nodes, layers, chart series | UI chrome |

---

## 3. Typography

| Role | Family | Weights | Fallback |
|---|---|---|---|
| Display (headings, card titles, big numbers) | **Bricolage Grotesque** | 600, 700 | `"Segoe UI", system-ui, sans-serif` |
| Body (reading, UI) | **Atkinson Hyperlegible** | 400, 700, 400 italic | `"Segoe UI", system-ui, -apple-system, sans-serif` |
| Utility (eyebrows, badges, code, timers, data) | **JetBrains Mono** | 400, 700 | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` |

Atkinson Hyperlegible was designed for low-vision readers. It keeps long study sessions comfortable and separates similar glyphs (I l 1, O 0).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=JetBrains+Mono:wght@400;700&display=swap">
```

```css
:root {
  --f-display: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
  --f-body: "Atkinson Hyperlegible", "Segoe UI", system-ui, -apple-system, sans-serif;
  --f-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
body { font-family: var(--f-body); font-size: 16px; line-height: 1.6; }
h1, h2, h3, h4 { font-family: var(--f-display); font-weight: 700; line-height: 1.2;
                 letter-spacing: -0.01em; text-wrap: balance; margin: 0; }
```

### Type scale

| Element | Size | Notes |
|---|---|---|
| Hero h1 | `clamp(1.7rem, 1.3rem + 1.8vw, 2.5rem)` | Dashboard only |
| h1 | `clamp(1.6rem, 1.2rem + 1.6vw, 2.25rem)` | One per view |
| h2 | `clamp(1.3rem, 1.1rem + .8vw, 1.6rem)` | Section titles |
| h3 | `1.15rem` | Card titles |
| Body | `16px / 1.6` | Max width `68ch` for prose |
| Question text | `1.08rem`, 700 | |
| Small | `.875rem` | Meta, captions |
| Eyebrow | `.72rem` mono, uppercase, `letter-spacing: .08em`, `--fg-3` | Above every h1 |
| Badge | `.68rem` mono, 700, uppercase, `.06em` | |
| Big stat | `1.6rem` display, `tabular-nums` | |
| Score | `3rem` display, 700 | Results pages |

**Rules**

- Every page title has an **eyebrow** above it naming the section ("Course reviewer", "Mock examination").
- Numbers that line up (stats, timers, scores, tables) use `font-variant-numeric: tabular-nums`.
- Formulas and code use the mono face on a `--surface-2` block.
- No more than two weights per family on one screen.

---

## 4. Spacing, radius, elevation

**Spacing.** Lay out siblings with `gap`, not margins. Values in use:

| Step | Value | Typical use |
|---|---|---|
| xs | 4–6 px | Inside diagram stacks, chip gaps |
| sm | 8–10 px | Button groups, option lists |
| md | 12–14 px | Card grids, form rows |
| lg | 18–22 px | Between sections of a view |
| xl | 26–28 px | Hero padding, page top |

**Radius**

| Token | Value | Use |
|---|---|---|
| `--r` | 14 px | Cards, sections, tiles, question cards |
| `--r-sm` | 9 px | Tables, notes, formula blocks |
| — | 10–11 px | Buttons, inputs, nav items, answer options |
| — | 18 px | Flashcard faces |
| — | 999 px | Badges, chips, pills, toast |

**Elevation.** Default is a 1 px `--line` border and **no shadow**. `--shadow` is reserved for things that float or flip: the active tab, the flashcard, the mobile drawer, the toast. Shadows on every card flatten the hierarchy.

---

## 5. Layout

### App shell

```
Desktop ≥ 900px                         Phone < 900px
┌──────────┬────────────────────────┐   ┌────────────────────────┐
│ Sidebar  │ Main (max 980px)       │   │ ☰  Brand        (sticky)│
│ 268px    │  eyebrow               │   ├────────────────────────┤
│ brand    │  h1                    │   │ Main, full width        │
│ search   │  content…              │   │ 16px gutters            │
│ nav      │                        │   │                         │
│ modules  │                        │   └────────────────────────┘
│ footer   │                        │   Drawer slides in from left,
└──────────┴────────────────────────┘   scrim behind, Esc closes.
```

```css
.shell   { display: grid; grid-template-columns: 268px minmax(0, 1fr); min-height: 100vh; }
.sidebar { position: sticky; top: env(safe-area-inset-top, 0px);
           height: calc(100vh - env(safe-area-inset-top, 0px)); overflow-y: auto;
           background: var(--surface); border-right: 1px solid var(--line); }
.main    { min-width: 0; padding-block: 28px 80px;
           padding-left: max(16px, env(safe-area-inset-left, 0px));
           padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.wrap        { max-width: 980px; margin: 0 auto; display: flex; flex-direction: column; gap: 22px; }
.wrap.narrow { max-width: 760px; }

@media (max-width: 899px) {
  .shell   { grid-template-columns: minmax(0, 1fr); }
  .sidebar { position: fixed; inset: 0 auto 0 0; width: min(300px, 86vw); z-index: 40;
             transform: translateX(-102%); transition: transform .22s ease; }
  .sidebar.open { transform: none; }
}
```

### Breakpoints

| Width | What changes |
|---|---|
| < 900 px | Sidebar becomes a drawer; top bar appears; exam side panel stacks below |
| < 760 px | 2- and 3-column grids become 1 column; stat row becomes 2×2 |
| < 640 px | Side-by-side diagrams stack |
| < 560 px | Diagram flows turn vertical (arrows rotate 90°); topic rows wrap meta below title |
| < 480 px | Layer diagrams drop their label column |

### Rules

- Side gutter is always `max(16px, env(safe-area-inset-*))`.
- Any flex/grid child that holds text gets `min-width: 0`.
- Tables, wide diagrams and code blocks sit inside `overflow-x: auto` wrappers. The page body never scrolls sideways.
- Sticky headers use `top: env(safe-area-inset-top, 0px)`, never `0`.
- Tap targets are at least **44 px** tall.

---

## 6. Components

Each component lists its purpose, anatomy and the states it must support.

### 6.1 Buttons

| Variant | Class | Use |
|---|---|---|
| Primary | `.btn.primary` | One main action per area ("Start", "Check answer", "Next →") |
| Secondary | `.btn` | Other actions |
| Ghost | `.btn.ghost` | Inline links like "Review lesson →" |
| Small | `.btn.sm` | Toolbars, card footers (36 px min height) |
| Toggled | `.btn.on` + `aria-pressed="true"` | Bookmark, Mark complete, Flag, Known/Review |

```css
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
       min-height: 44px; padding: 10px 18px; border-radius: 11px;
       border: 1px solid var(--line-2); background: var(--surface); color: var(--fg);
       font-weight: 700; font-size: .95rem; cursor: pointer; }
.btn:hover { background: var(--surface-2); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); }
.btn.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-2); }
.btn[disabled] { opacity: .45; cursor: not-allowed; }
```

Labels say exactly what happens: "Mark as complete" → "Completed", "Submit exam", "Yes, erase everything". Not "OK" or "Submit".

### 6.2 Priority badges

Shape + color + word, so they read in grayscale and for color-blind users.

```css
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px;
         font-family: var(--f-mono); font-size: .68rem; font-weight: 700;
         letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.badge::before { content: ""; width: 7px; height: 7px; border-radius: 2px; background: currentColor; }
.badge.high   { background: var(--hi-soft);  color: var(--hi); }
.badge.high::before { border-radius: 0; clip-path: polygon(50% 0, 100% 100%, 0 100%); width: 9px; height: 8px; } /* ▲ */
.badge.medium { background: var(--med-soft); color: var(--med); }
.badge.medium::before { border-radius: 50%; }                                                             /* ● */
.badge.low    { background: var(--low-soft); color: var(--low); }                                         /* ■ */
.badge.done   { background: var(--good-soft); color: var(--good); }
.badge.done::before { content: "✓"; background: none; width: auto; height: auto; }
.badge.plain  { background: var(--surface-2); color: var(--fg-2); }
.badge.plain::before { display: none; }
```

Labels: "High priority", "Medium priority", "Low priority", "Completed".

### 6.3 Cards and surfaces

- `.card`: `--surface` background, 1 px `--line` border, `--r` radius, 20 px padding (26 px for `.pad-lg`).
- Cards are for **separate objects** (a stat, a module, a question). Don't wrap every paragraph in a card.
- Clickable cards (`.modcard`, `.tile`, `.topicrow`) are real `<button>`s. Hover turns the border `--accent`; there is no lift or shadow.

### 6.4 Dashboard pieces

| Piece | Anatomy |
|---|---|
| **Hero** | Eyebrow · h1 · one-sentence status summary · primary "Continue: {next item}" + secondary action · progress ring on the right |
| **Progress ring** | 132 px `conic-gradient(var(--accent) calc(var(--p) * 1%), var(--surface-3) 0)` with a 104 px inner disc; big % + caption; `role="img"` + `aria-label` |
| **Stat row** | 4 cards (2×2 on phones): big tabular number + caption ("0/61 Topics completed") |
| **Quick-access tiles** | 3-column grid of buttons: 36 px icon square in `--accent-soft` · title · one-line description with a count |
| **"Next" list** | Rows with title · module tag · priority badge |

The status sentence changes with state: not started / in progress (with numbers) / finished.

### 6.5 Progress bar

```css
.progress { height: 8px; border-radius: 99px; background: var(--surface-3); overflow: hidden; }
.progress > i { display: block; height: 100%; background: var(--accent); border-radius: 99px;
                transition: width .4s ease; }
```

Mini version in the sidebar: 34 × 5 px with an `aria-label` of the percentage.

### 6.6 Navigation

- Sidebar items: icon (19 px, 1.9 stroke, line style) + label; current item gets `--accent-soft` background and `aria-current="page"`.
- Section labels in the sidebar use the eyebrow style.
- Secondary list (e.g. modules) shows a two-digit mono number, a short name and a mini progress bar.
- Breadcrumbs above lesson titles: `Course / M3 · RAMI & IIRA / Topic 2 of 7`.
- Pager at the bottom of each lesson: "← Previous title" (secondary) and "Next title →" (primary). Titles truncate with an ellipsis.

### 6.7 Tabs and segmented choices

- Tabs: row of buttons with `role="tab"` and `aria-selected`; the selected tab gets `--surface`, a border and `--shadow`.
- Segmented options (question count, time limit): `.optgroup` buttons with `aria-pressed`; selected = `--accent` border + `--accent-soft` fill.

### 6.8 Tables

```css
.tbl-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: var(--r-sm); }
.tbl { border-collapse: collapse; width: 100%; font-size: .9rem; min-width: 460px; }
.tbl th, .tbl td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
.tbl thead th { background: var(--surface-2); font-family: var(--f-mono); font-size: .72rem;
                text-transform: uppercase; letter-spacing: .05em; color: var(--fg-2); }
.tbl td:first-child { font-weight: 700; }
```

Comparison tables always use the first column as the row label (bold). Columns are the things being compared.

### 6.9 Lesson page

A lesson is a vertical stack, in this order:

1. Breadcrumbs
2. Header: priority badge · source reference (mono, `--fg-3`) · h1 · "Mark as complete" and "Bookmark" toggles
3. `<details open>` sections with a numbered square (`.sec-n`, 28 px, mono, `--accent-soft`):
   **1 Simple explanation** · **2 Real-world example** · **3 Visual explanation**
4. **4 Exam essentials** callout (always open)
5. *Key definitions* (collapsed `<details>` with a definition list)
6. **Common points of confusion** callout
7. **5 Quick check** (2–3 questions)
8. Pager

| Callout | Style | Content |
|---|---|---|
| Essentials | `--accent-soft` fill, 1 px `--accent` border, `--r` | 3–5 bullets of must-remember facts |
| Confusion | `--med-soft` fill, no border | "X vs Y" traps |
| Note | `--surface-2`, `--r-sm` | Meta info |

Numbered step lists in prose (`ol.steps`) put the number in a 26 px mono square absolutely positioned left, with text indented 38 px. Don't use a grid here: it squeezes the text into a narrow column.

Definition list (`.defs`): 2-column grid (term column `minmax(130px, 220px)`, term on `--surface-2`), collapsing to one column under 560 px.

### 6.10 Question card

One component serves practice, exam and review modes.

```
┌ Q3 / 12 · MULTIPLE CHOICE · M3 · RAMI 4.0: the three axes ┐
│ Question text (1.08rem, bold)                              │
│ [A] Option            (48px min, 1.5px border, radius 11)  │
│ [B] Option                                                 │
│ ┌ Feedback ───────────────────────────────────────────┐    │
│ │ Correct / Not quite                                 │    │
│ │ Correct answer: …   Why: …   Why the others are wrong│    │
│ │ Review lesson: … →                                  │    │
│ └─────────────────────────────────────────────────────┘    │
│ [Check answer]  /  [Next question →]                       │
└────────────────────────────────────────────────────────────┘
```

| State | Option style |
|---|---|
| Default | `--line` border |
| Hover | `--accent` border |
| Selected | `--accent` border + `--accent-soft` fill; letter square fills `--accent` |
| Correct (after check) | `--good` border + `--good-soft` fill + label "Correct" |
| Wrong pick | `--bad` border + `--bad-soft` fill + label "Your answer" |

**Question types:** multiple choice (shuffle options every time), true/false (two large buttons), matching (label + `<select>` per row), short answer (keyword match, plus an "I meant the same — count it" override), calculation (numeric input with tolerance and unit).

**Modes:**
- **Practice** — instant feedback after "Check answer".
- **Exam** — no feedback until submit.
- **Review** — all feedback shown, inputs disabled.

Feedback always includes the correct answer, a short "why", and a link back to the lesson.

### 6.11 Exam / timed test

- **Sticky exam bar:** mono timer (`.timer`, turns `--bad` under 60 s) · "7/10 answered" · Flag toggle · primary "Submit exam".
- **Question navigator:** grid of 40 px numbered buttons. Answered = `--accent-soft`; current = 3 px `--fg` outline; flagged = ⚑ corner mark in `--flag`; after submit, right/wrong colors.
- **Submit confirmation:** an inline panel (2 px `--bad` border, `--bad-soft` fill) that states consequences ("3 questions are unanswered and will be marked wrong. You can't change answers after submitting.") with "Yes, submit" / "Keep working". Never use `window.confirm()`.
- **Results:** big score · "x of y correct" · time used · breakdown bars by section and by question type · "Suggested topics to revise" list · full review of every question.

### 6.12 Flashcards

- 3-D flip: `perspective: 1400px` on the stage; inner element rotates `rotateY(180deg)` over `.5s cubic-bezier(.2,.7,.2,1)`; faces use `backface-visibility: hidden`.
- Front: mono hint ("QUESTION · M1 · topic") · display-face question · "Tap to reveal". Back has an `--accent` border, the answer, and an optional dashed-divider note.
- The card is one `<button>` with an `aria-label` describing which side shows.
- Controls: ← Prev · ⟲ Review · ✓ Known · Next →. Deck select · Shuffle · Restart.
- Keyboard: Space/Enter flips, ← → move, K = known, R = review. Show these as `.kbd` keycaps in the intro line.

### 6.13 Formula card

Title + priority badge → mono formula block → "In plain English" → variable table (symbol · meaning · unit) → numbered worked example in mono → practice input with a Check button and inline feedback → source line.

### 6.14 Feedback and messages

| Pattern | Use | Style |
|---|---|---|
| **Toast** | Confirms a quick action ("Bookmarked", "Copied") | Bottom-center pill, `--fg` background / `--bg` text, `role="status"`, 1.8 s |
| **Inline confirm** | Destructive or irreversible action | Red-bordered panel with two buttons |
| **Empty state** | No data yet | Centered `--fg-2` text saying what will appear and how to get it |
| **Feedback block** | Answer result | `--good-soft` / `--bad-soft` with a matching border |

---

## 7. Diagram system

Diagrams teach. Prefer **HTML/CSS diagrams** so text stays real, selectable and reflowable.

### Categorical coloring

Apply `.c1`…`.c6` on a diagram element. Each sets two local variables:

```css
.c1 { --cf: var(--c1); --cs: var(--c1s); }   /* …through .c6 */
.dnode, .dcard { background: var(--cf); border: 1.5px solid var(--cs); border-radius: 10px; padding: 10px 12px; }
```

### Primitives

| Primitive | Looks like | Use for | Phone behavior |
|---|---|---|---|
| `flow` | `[A] → [B] → [C]` | Processes, pipelines, request/response | Becomes vertical; arrows rotate |
| `cycle` | Numbered nodes + "↻ repeat" pill | Loops (scan cycles, feedback loops) | Vertical |
| `stack` | Horizontal bars with a 5 px colored left edge: name · role · note | Layers, levels, tiers | Label column drops |
| `grid` | Auto-fit cards (`minmax(150px, 1fr)`) | Sets of parallel items (6 V's, technologies) | Wraps |
| `pyramid` | Centered bars of increasing width | Hierarchies (ERP → sensors) | Inverted variant goes full width |
| `stairs` | Columns of rising height | Ordered levels, maturity ladders | Turns into a vertical list |
| `nest` | Boxes inside boxes | Containment (component ⊃ shell ⊃ thing) | Stays nested |
| `split` | Two panels side by side | A vs B | Stacks |
| `bars` | Label · bar · value | Comparing magnitudes (log scale noted in caption) | Unchanged |
| `timeline` | Cards with gap pills between | Dated sequences | Vertical |

### SVG rules (curves, charts, networks)

- `viewBox` + `width: 100%` + a `min-width` of about 72% of the viewBox width, inside an `overflow-x: auto` wrapper.
- Text uses classes (`.dt`, `.dt.sm`, `.dt.xs`, `.dt.b`, `.dt.acc`) colored with tokens; never hard-code `fill="#000"`.
- Arrowheads: one `<marker>` per SVG with `fill="currentColor"`; the SVG's `color` is `--fg-3`.
- Every shape has an explicit fill; every SVG has `role="img"` and an `aria-label` describing what it shows.
- Leave margin in the viewBox for the outermost labels.

### Figure wrapper

```html
<figure class="figure">
  <div class="fig-t">Diagram title</div>
  <div class="dg"><!-- diagram --></div>
  <figcaption>One or two sentences on what to notice.</figcaption>
</figure>
```

### Source images (slides, screenshots)

Crop to the relevant region (never a full slide), place on a white padded frame with a 1 px border, add a mono "FROM THE LECTURE SLIDES" tag, and caption with a plain-English explanation plus `— File name, slide N`. Pair each one with an original diagram that simplifies it.

---

## 8. Content format and voice

### The 5-step lesson template

| Step | Section | Rule |
|---|---|---|
| 1 | **Simple explanation** | Everyday words first; define each technical term the first time it appears; under ~150 words |
| 2 | **Real-world example** | A familiar situation or analogy, plus the source material's own example |
| 3 | **Visual explanation** | At least one original diagram; a source image only as support |
| 4 | **Exam essentials** | 3–5 bullets: lists to memorize, numbers, "A = B" relationships, formulas |
| 5 | **Quick check** | 2–3 questions, easiest first |

Plus, where useful: **Key definitions** (term → one sentence) and **Common points of confusion** ("X vs Y: X does…, Y does…").

### Priority system

- **High** — fundamental, repeated, compared, or annotated by the instructor.
- **Medium** — supports the main ideas.
- **Low** — context, history, tool lists.

About half the topics should be high. If everything is high, nothing is. Always state that priorities are a study guide, not a prediction.

### Writing rules

- Short, direct sentences in active voice. Name things the way learners recognize them.
- Teach the source's own terms and versions first. Mark anything added from outside as supplementary, with a link.
- Flag discrepancies in the source openly in the "confusion" callout rather than silently fixing them.
- Buttons state the action; toasts confirm it in past tense ("Published", "Copied").
- Errors say what went wrong and how to fix it: "That code isn't valid. Copy the whole code from the other device and try again."
- Avoid filler: no "simply", "just", "it's worth noting", no emoji as section markers.

---

## 9. Interaction and state

| Concern | Pattern |
|---|---|
| **Routing** | Hash tokens with safe characters only (`#t-rami`, `#mock`). Restore the view from the hash on load. |
| **Persistence** | One `localStorage` key with a version suffix (`app.v1`), one JSON object. Wrap every read and write in `try/catch`; the app must work when storage is blocked. |
| **Saved data** | Completed items, bookmarks, card marks (known/review), per-question last result, quiz bests, exam history (cap at 50), last-visited item. |
| **Cross-device** | "My progress" page shows a base64 export code with Copy and Import buttons. Explain that storage is per browser and per device. |
| **Dialogs** | No `alert`, `confirm` or `prompt`. Use inline confirm panels and toasts. |
| **Copy to clipboard** | Call `navigator.clipboard.writeText` inside the click handler; on failure, select the text and say "Press Ctrl/Cmd+C". |
| **Motion** | 0.22 s drawer slide, 0.25 s view fade-up (4 px), 0.4 s progress fill, 0.5 s flashcard flip. All disabled under `prefers-reduced-motion`. |
| **Focus** | Move focus to `<main tabindex="-1">` after each view change; scroll to top. |
| **Shuffling** | Randomize answer order every attempt; order quiz questions easy → hard. |

---

## 10. Accessibility checklist

- [ ] Visible focus ring: `outline: 3px solid var(--accent); outline-offset: 2px` on `:focus-visible`.
- [ ] Every interactive element is a `<button>`, `<a>`, `<input>` or `<select>`; no clickable `<div>`s.
- [ ] Toggles use `aria-pressed`; tabs use `role="tab"` + `aria-selected`; current nav uses `aria-current="page"`.
- [ ] Priority, correctness and progress are never shown by color alone.
- [ ] Inputs have `<label>`s (visually hidden with `.sr` when needed).
- [ ] Feedback regions use `role="status"`; the timer uses `role="timer"`.
- [ ] Charts and diagrams have `role="img"` + `aria-label` or real text.
- [ ] Tap targets ≥ 44 px; body text ≥ 16 px.
- [ ] Both themes keep text contrast ≥ 4.5:1.
- [ ] Keyboard shortcuts are listed on screen and never fire while typing in a field.

---

## 11. Content data structure

Keep content in data files, separate from components, so it can be edited without touching UI code.

```js
// modules.js
window.COURSE = { modules: [{
  id: "m3", num: 3, title: "Reference Architectures", short: "RAMI & IIRA",
  source: "Lecture file name, slides 24–53", summary: "One sentence.",
  topics: [{
    id: "t-rami", title: "RAMI 4.0: the three axes", priority: "high",   // high | medium | low
    slides: "Class 2 · slides 26–28",
    simple: "<p>HTML…</p>", example: "<p>HTML…</p>",
    visuals: [{ svg: "rami" }, { img: "rami", caption: "…", source: "File, slide 26" }],
    definitions: [["Term", "One-sentence definition."]],
    essentials: ["Bullet", "Bullet"],
    confusions: ["X vs Y: …"]
  }]
}]};

// questions.js — practice questions, tagged by topic id
window.QUESTIONS = [
  { id: "q1", t: "t-rami", type: "mcq", d: 1, q: "…", opts: ["correct first", "…"], why: "…",
    wrong: [null, "why option 2 is wrong", "…"] },
  { id: "q2", t: "t-rami", type: "tf", d: 1, q: "…", a: false, why: "…" },
  { id: "q3", t: "t-rami", type: "match", d: 2, q: "…", pairs: [["Left", "Right"]], why: "…" },
  { id: "q4", t: "t-rami", type: "short", d: 2, q: "…", accept: ["kw1+kw2"], ans: "Model answer", why: "…" },
  { id: "q5", t: "t-rami", type: "calc", d: 3, q: "…", a: 0.64, tol: 0.001, unit: "", why: "…" }
];
// d = difficulty: 1 recall · 2 understanding/comparison · 3 application/calculation
```

Flashcards, formulas and cheat-sheet lists follow the same idea: each item carries a topic id so it can link back to its lesson.

---

## 12. Starter template

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Product Name</title>
  <!-- fonts link from §3 -->
  <style>
    /* §2 tokens, §3 type, §5 layout, §6 components */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; overflow-x: hidden; }
    :focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="brand"><div class="brand-mark">AB</div><div><b>Product</b><span>Subtitle</span></div></div>
      <nav class="nav"><!-- buttons with icon + label --></nav>
      <div class="side-foot">Progress is saved in this browser only.</div>
    </aside>
    <main class="main" id="main" tabindex="-1">
      <div class="wrap">
        <div class="eyebrow">Section</div>
        <h1>Page title</h1>
        <!-- content -->
      </div>
    </main>
  </div>
</body>
</html>
```

**Brand mark:** a 38 px rounded square (radius 11) in `--accent` with 2–4 mono initials in `--on-accent`. Simple line icons (24 px grid, 1.9 stroke, round caps and joins, `currentColor`).

---

## 13. Porting notes

- **Tailwind:** map tokens in `tailwind.config` → `colors: { bg: 'var(--bg)', surface: 'var(--surface)', accent: 'var(--accent)', … }` and `fontFamily: { display: 'var(--f-display)', … }`. Keep the token CSS block in a global stylesheet.
- **React / Vue:** one component per §6 item (`<Badge priority>`, `<QuestionCard mode>`, `<Flashcard>`, `<Diagram type>`). Content stays in data files (§11).
- **Other subjects:** only the content files change. Keep the 5-step lesson template and the priority system.
- **Re-skinning:** to give a new project its own identity, change only `--accent*`, `--hi*` and the display font. Keep the neutrals, semantic colors and layout.

---

## 14. Don'ts

- Don't use literal hex colors in components.
- Don't add gradients, glassmorphism, emoji section markers or decorative illustrations.
- Don't put shadows on every card or round everything the same.
- Don't center long text or whole pages.
- Don't use color as the only signal.
- Don't use `alert()`/`confirm()`, or block the page with modals for routine actions.
- Don't paste full slides as images in place of teaching.
- Don't invent formulas, numbers or sources; mark outside material as supplementary.
- Don't let any view scroll horizontally on a phone.

---

## 15. Prompt for AI assistants

Paste this with the file:

> Build [product] using the attached DESIGN.md ("Signal Study"). Use its color and font tokens exactly, in both light and dark themes. Use the app shell (sidebar on desktop, drawer on mobile), the component patterns in §6, the HTML-first diagram primitives in §7, and the 5-step content template in §8. Store content in separate data files (§11). Save progress in localStorage with try/catch and an export/import code. Meet every item in the §10 accessibility checklist and test at 375 px width with no horizontal scrolling.
