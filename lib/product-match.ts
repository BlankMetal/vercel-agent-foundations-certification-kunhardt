import type { Product } from "./types";

// The API's `search` param is a single-phrase substring match: "hoodie" finds
// the Black Pullover Hoodie, but "black hoodie" finds nothing and "hat" misses
// the cap and beanie. Both catalog tools rank the cached full catalog here
// instead, so browsing and single-item lookup agree on what matches.

const STOPWORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those", "one", "ones", "your",
  "my", "me", "of", "for", "with", "and", "in", "on", "about", "some", "vercel",
]);

// How much a match in each field counts. A word in the name or tags describes
// what the product is; a word in the description may only be mentioned in
// passing (the enamel pin's description says it clips onto a bag).
const FIELD_WEIGHTS = {
  name: 1,
  tags: 1,
  category: 0.8,
  description: 0.4,
} as const;

type Field = keyof typeof FIELD_WEIGHTS;

// Results scoring below this fraction of the best result are dropped: with
// "bag", actual bags score 0.8 to 1 and the pin's description mention 0.4.
const RELATIVE_CUTOFF = 0.5;

function stem(t: string): string {
  return t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t;
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .map(stem);
}

// Edit distance where swapping two adjacent letters counts as one edit
// ("bottel" → bottle), with an early exit once a row exceeds `max`.
function withinEdits(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        row[j] = Math.min(row[j], prev2[j - 2] + 1);
      }
    }
    if (Math.min(...row) > max) return false;
    prev2 = prev;
    prev = row;
  }
  return prev[b.length] <= max;
}

function sharedPrefix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

// How well one query word matches one product word, from 0 to 1. Short words
// get no fuzziness: "cap" and "cup", "hat" and "mat" are different products.
// Typo matching (`fuzzy`) is only allowed on short, curated fields; against
// description prose it turned "jacket" into "pocket" and "watch" into "water".
function wordMatch(q: string, t: string, fuzzy: boolean): number {
  if (q === t) return 1;
  if (q.length >= 3 && t.startsWith(q)) return 0.8; // "hood" → hoodie
  if (!fuzzy || q.length < 4) return 0;
  if (withinEdits(q, t, q.length >= 8 ? 2 : 1)) return 0.7; // "notebok", "tumblr"
  // Same word with a different ending: "hoody" → hoodie.
  if (q.length >= 5 && sharedPrefix(q, t) >= q.length - 1) return 0.7;
  return 0;
}

type IndexedProduct = {
  product: Product;
  fields: Record<Field, string[]>;
  // Field text with separators removed, so "tshirt" finds "T-Shirt".
  joined: Record<Field, string>;
};

function index(p: Product): IndexedProduct {
  const raw: Record<Field, string> = {
    name: `${p.name} ${p.slug}`,
    tags: p.tags.join(" "),
    category: p.category,
    description: p.description,
  };
  const fields = {} as Record<Field, string[]>;
  const joined = {} as Record<Field, string>;
  for (const f of Object.keys(raw) as Field[]) {
    fields[f] = tokens(raw[f]);
    joined[f] = raw[f].toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  return { product: p, fields, joined };
}

// A query word against a product: `score` is its best match across fields,
// scaled by the field's weight (0 means the word appears nowhere). `exact`
// records whether the word appeared as-is in any field, regardless of weight.
function wordScore(q: string, item: IndexedProduct): { score: number; exact: boolean } {
  let score = 0;
  let exact = false;
  for (const f of Object.keys(FIELD_WEIGHTS) as Field[]) {
    let quality = 0;
    const fuzzy = f !== "description";
    for (const t of item.fields[f]) quality = Math.max(quality, wordMatch(q, t, fuzzy));
    if (quality < 0.9 && q.length >= 4 && item.joined[f].includes(q)) quality = 0.9;
    if (quality === 1) exact = true;
    score = Math.max(score, quality * FIELD_WEIGHTS[f]);
  }
  return { score, exact };
}

// `exact` is true when every query word appeared as-is on the product.
export type RankedProduct = { product: Product; score: number; exact: boolean };

// Every query word must match somewhere on a product. Products are scored by
// the average of their word scores and returned best first, minus anything
// far below the best result.
export function rankProducts(query: string, catalog: Product[]): RankedProduct[] {
  const wanted = tokens(query);
  if (wanted.length === 0) return catalog.map((product) => ({ product, score: 1, exact: true }));

  const ranked: RankedProduct[] = [];
  for (const item of catalog.map(index)) {
    const words = wanted.map((q) => wordScore(q, item));
    if (words.some((w) => w.score === 0)) continue;
    ranked.push({
      product: item.product,
      score: words.reduce((sum, w) => sum + w.score, 0) / words.length,
      exact: words.every((w) => w.exact),
    });
  }
  ranked.sort((a, b) => b.score - a.score);
  const top = ranked[0]?.score ?? 0;
  return ranked.filter((r) => r.score >= top * RELATIVE_CUTOFF);
}

export function searchCatalog(query: string, catalog: Product[]): Product[] {
  return rankProducts(query, catalog).map((r) => r.product);
}

export type MatchResult =
  | { kind: "match"; product: Product }
  | { kind: "ambiguous"; candidates: Product[] }
  | { kind: "none" };

export function matchProduct(query: string, catalog: Product[]): MatchResult {
  const raw = query.trim().toLowerCase();

  // A slug or id from an earlier result resolves directly.
  const exact = catalog.find((p) => p.slug === raw || p.id === raw);
  if (exact) return { kind: "match", product: exact };

  // When some products contain the shopper's words as-is, near-misses don't
  // compete: "pen" is the Click Pen, not also the Pencil Set. Field weight
  // doesn't matter here, so the cap still counts as a "hat" via its category.
  // A description mention alone can't identify a product: "the jacket" must
  // not resolve to the enamel pin whose description says it suits jackets.
  // Description-only matches score at most the description weight.
  const all = rankProducts(query, catalog).filter(
    (r) => r.score > FIELD_WEIGHTS.description,
  );
  const exactOnly = all.filter((r) => r.exact);
  const ranked = exactOnly.length > 0 ? exactOnly : all;
  if (ranked.length === 0) return { kind: "none" };
  if (ranked.length === 1) return { kind: "match", product: ranked[0].product };

  // No tiebreak on purpose: "black hat" fits all three hats (the Bucket Hat by
  // name, the cap and beanie by category). Several close fits means the
  // shopper hasn't picked one yet, so ask.
  return { kind: "ambiguous", candidates: ranked.map((r) => r.product) };
}
