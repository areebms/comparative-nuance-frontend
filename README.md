# Embedding Analytics — Frontend

Interactive dashboard for exploring semantic similarity across corpora — with confidence intervals on every score.

Select one or two reference terms, toggle corpora on/off, and see where the models agree and where they diverge.

**→ [Live Demo](https://www.embedding-analytics.com)** &nbsp;|&nbsp; **→ [Backend Repo](https://github.com/areebms/embedding-analytics)**

---

## Features

**Dual-term queries** — select up to two terms from the autocomplete. The backend averages and re-normalizes their vectors, letting you explore the semantic neighborhood of a concept pair (e.g. "market" + "price").

**Scatter chart** — each dot is one corpus's cosine similarity for a related term. Black dot = mean. Horizontal line = min-to-max spread. Wide spread = disagreement. Tight cluster = reliable.

**Results table** — ranked by consensus (mean similarity) or divergence (SD). Per-corpus columns show cosine similarity, 95% CI, and occurrence count.

**Corpus pinning** — pin a corpus to re-sort by z-score, surfacing terms where that corpus is a statistical outlier.

**Filtering** — only terms present in all selected corpora with ≥10 occurrences qualify. Filtered counts shown in column tooltips.

Corpus chips are colored by publication year (warm → cool gradient).

---

## Data flow

```
GET /books → sorted by published_year, assigned yearColor

POST /similarity/{bookId} per displayed book (parallel)
    → body: { primary_term, secondary_term? }
    → cached in memory by bookId, cleared on term change

useSimilarityData (memoized)
    → intersect terms across books (min n=10)
    → compute mean, std, z-score per term per book
    → sort by mean | SD | z-score → slice top 25
    → feed scatter chart + results table
    → export sharedTerms to autocomplete
```

---

## Tech stack

| | |
|---|---|
| React 18 + Vite | Framework + build |
| Material UI v5 | Layout, Autocomplete, table, chips |
| Chart.js + react-chartjs-2 | Scatter plot |
| simple-statistics | mean, std, z-score |
| AWS Amplify | CI/CD + hosting |

---

## Quick start

```bash
git clone https://github.com/areebms/embedding-analytics-frontend.git
cd embedding-analytics-frontend
npm install
```

Create `.env`:
```
VITE_API_URL=http://127.0.0.1:8000
```

```bash
npm run dev      # → http://localhost:5173
npm run build    # Production build → dist/
```

Deploy: push to `main` — Amplify runs `npm ci` → `npm run build` → deploys `dist/` automatically.

> `vite.config.js` proxies `/similarity/*` to `VITE_API_URL` in dev. `/books` is fetched using the full URL directly. No fallback if the variable is unset.

---

## Repo structure

```
src/
├── components/
│   ├── TopBar.jsx                  # Corpus chips, term autocomplete, sort control
│   ├── SimilarityScatterChart.jsx  # Chart.js scatter + range lines + mean dots
│   └── ResultsTable.jsx           # MUI table: consensus, elasticity, CIs
├── hooks/
│   └── useSimilarityData.tsx       # Memoized: intersect → score → sort → slice
├── utils/
│   └── bookColors.js              # Tableau-10 palette
├── App.jsx                         # Root: book fetch, similarity cache, term state
└── main.tsx                        # Entry point
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

**Areeb Siddiqi** — [LinkedIn](https://www.linkedin.com/in/areeb-siddiqi/) · [GitHub](https://github.com/areebms)
