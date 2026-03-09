# Embedding Analytics — Frontend

React dashboard for comparing how terms relate across different corpora — and how *confidently*. Powered by the [embedding-analytics](https://github.com/areebms/embedding-analytics) backend.

**→ [Live Demo](https://www.embedding-analytics.com)** &nbsp;|&nbsp; **→ [Backend Repo](https://github.com/areebms/embedding-analytics)**

---

## What it does

Pick a reference term. Toggle which corpora to compare. The dashboard shows the top similar terms ranked by cross-corpus consensus, with a scatter plot visualizing where the corpora agree and where they diverge.

**Scatter chart** — each colored dot is one corpus's cosine similarity score for a related term. The black dot is the mean. The horizontal line spans min to max. Wide spread = the corpora disagree. Tight cluster = robust, reliable relationship. The x-axis auto-scales to the actual data range.

**Results table** — ranked list of related terms with:
- **Consensus (Mean Similarity)** — average cosine similarity across all selected corpora
- **Elasticity (SD)** — standard deviation; higher means more disagreement between corpora
- **Per-corpus columns** — cosine similarity, coherence % (ensemble stability across training runs), and occurrence count (n=)

**Toggling corpora** — click a corpus chip in the top bar to show/hide it. Only corpora with a completed pipeline appear.

**Pinning a corpus** — click the pin icon on a chip to lock focus on that book. The table re-sorts by z-score relative to that corpus, surfacing terms where it's a statistical outlier compared to the others. The Sort dropdown disables when a corpus is pinned.

**Changing the reference term** — click any term in the results table. It becomes the new reference and all similarity data reloads.

**Filtering** — only terms present in *all* selected corpora with at least 10 occurrences qualify. Terms filtered out are counted in the ⓘ tooltip on each corpus column header.

---

## Data flow

```
GET /books (on mount)
    → bookData[] with id, label, author, title

on [bookData, term] change:
    → fetch GET /similarity/{bookId}/{term} for each displayed book in parallel
    → results cached in memory by bookId (similarityCache)
    → cache cleared on term change (stale fetches cancelled via flag)

useSimilarityData (memoized):
    → intersects terms across all selected books (min n=10)
    → computes mean, std, z-score per term per book
    → sorts by mean | elasticity | z-score depending on selection
    → slices to top 25
    → feeds SimilarityScatterChart + ResultsTable
```

---

## Tech stack

| | |
|---|---|
| React 18 + Vite | UI framework + build |
| Material UI v5 | Layout, AppBar, table, chips |
| Chart.js + react-chartjs-2 | Scatter plot |
| simple-statistics | mean, std, z-score |
| AWS Amplify | CI/CD + hosting |

---

## Known limitations

A few things that are in progress or not yet wired up:

- **Term input is read-only** — the Reference Term field in the top bar doesn't accept freeform input yet (the `onChange` handler has a `// Todo: Fix` comment). The only way to change the reference term is to click a row in the results table.
- **Confidence intervals not shown** — coherence % is displayed but CI calculation has a `// TODO: Add CI` note.

---

## Getting started

### Prerequisites
- Node.js 18+
- The [embedding-analytics backend](https://github.com/areebms/embedding-analytics) running locally, or point at the live API

### Setup

```bash
git clone https://github.com/areebms/embedding-analytics-frontend.git
cd embedding-analytics-frontend

npm install
```

Create a `.env` file:
```
VITE_API_URL=http://127.0.0.1:8000        # local backend
# VITE_API_URL=https://<lambda-url>       # or your deployed API
```

```bash
npm run dev      # → http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Serve the production build locally
```

> **Vite proxy:** `vite.config.js` only proxies `/similarity/*` to `VITE_API_URL` in dev. `/books` is fetched using the full `VITE_API_URL` directly. Both routes require the variable to be set — there's no fallback.

### Deploy

Push to `main` — `amplify.yml` runs `npm ci` → `npm run build` and deploys `dist/` automatically.

To connect to your own backend, add `VITE_API_URL` as an environment variable in the Amplify console under App settings → Environment variables.

---

## Repo structure

```
embedding-analytics-frontend/
├── src/
│   ├── components/
│   │   ├── TopBar.jsx                  # Sticky nav: corpus chips, term display, sort control
│   │   ├── SimilarityScatterChart.jsx  # Chart.js scatter + range lines + mean dots
│   │   └── ResultsTable.jsx            # MUI table: consensus, elasticity, per-corpus breakdown
│   ├── hooks/
│   │   └── useSimilarityData.jsx       # Memoized: intersect → score → sort → slice
│   ├── utils/
│   │   └── bookColors.js               # Tableau-10 color palette indexed by book position
│   ├── App.jsx                         # Root: book fetching, similarity cache, all state
│   └── main.jsx                        # Entry point
├── public/
├── amplify.yml                         # AWS Amplify build + deploy config
├── vite.config.js                      # Dev server + /similarity proxy
└── index.html
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

**Areeb Siddiqi** — [LinkedIn](https://www.linkedin.com/in/areeb-siddiqi/) · [GitHub](https://github.com/areebms)
