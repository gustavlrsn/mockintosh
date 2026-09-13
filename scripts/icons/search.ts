import type { IconRecord, SearchHit } from "./types";

export interface SearchOptions {
  limit?: number;
  category?: string;
}

function normalize(s: string): string {
  return s.toLowerCase();
}

function nameRank(name: string, token: string): number {
  if (name === token) return 3;
  if (name.startsWith(token)) return 2;
  if (name.includes(token)) return 1;
  return 0;
}

function tokenScore(icon: IconRecord, token: string): { score: number; nameRank: number } {
  const name = normalize(icon.name);
  const desc = normalize(icon.description);
  const collection = normalize(icon.collection);
  const category = normalize(icon.category);
  const file = normalize(icon.file);
  const themes = icon.themes.map(normalize).join(" ");
  const vibes = icon.vibes.map(normalize).join(" ");

  if (!token) return { score: 0, nameRank: 0 };
  const rank = nameRank(name, token);
  let score = 0;
  if (rank === 3) score += 100;
  else if (rank === 2) score += 80;
  else if (rank === 1) score += 60;
  if (desc.includes(token)) score += 40;
  if (collection.includes(token)) score += 30;
  if (file.includes(token)) score += 25;
  if (themes.includes(token) || category.includes(token)) score += 20;
  if (vibes.includes(token)) score += 10;
  return { score, nameRank: rank };
}

export interface IconScore {
  score: number;
  nameRank: number;
}

/** Score one icon against whitespace-separated query tokens (AND: every token must hit). */
export function scoreIcon(icon: IconRecord, query: string): IconScore {
  const tokens = query
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean);
  if (tokens.length === 0) return { score: 0, nameRank: 0 };
  let score = 0;
  let rank = 0;
  for (const token of tokens) {
    const part = tokenScore(icon, token);
    if (part.score === 0) return { score: 0, nameRank: 0 };
    score += part.score;
    if (part.nameRank > rank) rank = part.nameRank;
  }
  return { score, nameRank: rank };
}

export function searchIcons(
  catalog: IconRecord[],
  query: string,
  options: SearchOptions = {}
): SearchHit[] {
  const category = options.category ? normalize(options.category) : undefined;
  const limit = options.limit ?? 8;
  const hits: SearchHit[] = [];
  for (const icon of catalog) {
    if (category && normalize(icon.category) !== category) continue;
    const { score, nameRank } = scoreIcon(icon, query);
    if (score <= 0) continue;
    hits.push({ score, nameRank, icon, washout: false });
  }
  hits.sort(
    (a, b) =>
      b.nameRank - a.nameRank ||
      b.score - a.score ||
      a.icon.name.localeCompare(b.icon.name)
  );
  return hits.slice(0, limit);
}
