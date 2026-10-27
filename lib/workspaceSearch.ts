/** Small, literal-text search. User input is never compiled as a regular expression. */
export interface SearchDocument<T> {
  id: string;
  group?: string;
  title: string;
  location: string;
  text: string;
  keywords?: string[];
  aliases?: string[];
  target: T;
}
export interface SearchResult<T> extends SearchDocument<T> {
  score: number;
  excerpt: string;
}
const stopWords = new Set('a an and are at be can do for from how i in is it me my of on please show the to what where with you your'.split(' '));
export function normalizeSearch(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function tokens(value: string) { return normalizeSearch(value).split(' ').filter(Boolean); }
// One insertion, deletion, substitution or adjacent transposition; bounded by word length.
function nearWord(a: string, b: string) {
  if (a.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const different: number[] = [];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) different.push(i);
    return different.length <= 1 || (different.length === 2 && different[1] === different[0] + 1 && a[different[0]] === b[different[1]] && a[different[1]] === b[different[0]]);
  }
  const short = a.length < b.length ? a : b, long = a.length < b.length ? b : a;
  let i = 0, j = 0;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; }
    else { if (j !== i) return false; j++; }
  }
  return true;
}
function wordScore(term: string, words: string[], fuzzy = false) {
  const singular = (word: string) => word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
  if (words.some(word => word === term || singular(word) === singular(term))) return 1;
  if (term.length >= 2 && words.some(word => word.startsWith(term))) return 0.7;
  return fuzzy && words.some(word => nearWord(term, word)) ? 0.4 : 0;
}
function excerpt(text: string, terms: string[]) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let best = sentences[0] || text, score = -1;
  for (const sentence of sentences) {
    const words = tokens(sentence);
    const next = terms.reduce((sum, term) => sum + wordScore(term, words, true), 0);
    if (next > score) { score = next; best = sentence; }
  }
  if (best.length <= 170) return best;
  const words = best.split(/\s+/);
  const match = words.findIndex(word => terms.some(term => normalizeSearch(word).startsWith(term)));
  const start = Math.max(0, match - 6);
  const clipped = words.slice(start).join(' ');
  return `${start ? '…' : ''}${clipped.slice(0, 165).replace(/\s+\S*$/, '')}…`;
}
export function createWorkspaceSearch<T>(documents: SearchDocument<T>[]) {
  // Tokenize canonical content once, outside React's render and the scene frame loop.
  const index = documents.map(document => ({
    document,
    title: tokens(document.title),
    titlePhrase: normalizeSearch(document.title),
    keywords: tokens((document.keywords || []).join(' ')),
    body: tokens(`${document.location} ${document.text}`),
    phrase: normalizeSearch(`${document.title} ${document.text}`),
    aliases: (document.aliases || []).map(normalizeSearch),
  }));
  return (query: string, limit = 6): SearchResult<T>[] => {
    const phrase = normalizeSearch(query.slice(0, 180));
    const terms = [...new Set(tokens(phrase).filter(term => !stopWords.has(term)))].slice(0, 12);
    if (!terms.length) return [];
    const matches: SearchResult<T>[] = [];
    for (const item of index) {
      const exact = item.aliases.includes(phrase);
      let score = exact ? 100 : 0, matched = 0;
      for (const term of terms) {
        const value = Math.max(wordScore(term, item.title, true) * 12, wordScore(term, item.keywords, true) * 8, wordScore(term, item.body) * 3);
        if (value) matched++;
        score += value;
      }
      if (!exact && matched !== terms.length) continue;
      if (item.titlePhrase.includes(phrase)) score += 15;
      else if (item.phrase.includes(phrase)) score += 4;
      matches.push({ ...item.document, score, excerpt: excerpt(item.document.text, terms) });
    }
    matches.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    const groups = new Set<string>();
    return matches.filter(result => {
      const key = result.group || result.id;
      if (groups.has(key)) return false;
      groups.add(key); return true;
    }).slice(0, limit);
  };
}
