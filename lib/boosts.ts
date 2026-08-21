const KEY = "nm-boosts-v1";

type BoostStore = {
  day: string;
  voted: string[];
  counts: Record<string, number>;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function empty(): BoostStore {
  return { day: today(), voted: [], counts: {} };
}

export function readBoosts(): BoostStore {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as BoostStore;
    if (parsed.day !== today()) {
      return { day: today(), voted: [], counts: parsed.counts ?? {} };
    }
    return {
      day: parsed.day,
      voted: parsed.voted ?? [],
      counts: parsed.counts ?? {},
    };
  } catch {
    return empty();
  }
}

export function writeBoosts(store: BoostStore) {
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export function canBoost(domain: string, store: BoostStore) {
  return !store.voted.includes(domain);
}

export function applyBoost(domain: string, store: BoostStore): BoostStore {
  if (!canBoost(domain, store)) return store;
  return {
    day: today(),
    voted: [...store.voted, domain],
    counts: {
      ...store.counts,
      [domain]: (store.counts[domain] ?? 0) + 1,
    },
  };
}
