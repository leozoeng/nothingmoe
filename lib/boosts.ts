const KEY = "nm-boosts-v2";
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

type BoostStore = {
  lastBoostAt: Record<string, number>;
  counts: Record<string, number>;
};

function empty(): BoostStore {
  return { lastBoostAt: {}, counts: {} };
}

export function readBoosts(): BoostStore {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<BoostStore>;
    return {
      lastBoostAt: parsed.lastBoostAt ?? {},
      counts: parsed.counts ?? {},
    };
  } catch {
    return empty();
  }
}

export function writeBoosts(store: BoostStore) {
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export function canBoost(domain: string, store: BoostStore, now = Date.now()) {
  const last = store.lastBoostAt[domain];
  if (!last) return true;
  return now - last >= COOLDOWN_MS;
}

export function msUntilBoost(domain: string, store: BoostStore, now = Date.now()) {
  const last = store.lastBoostAt[domain];
  if (!last) return 0;
  return Math.max(0, COOLDOWN_MS - (now - last));
}

export function applyBoost(domain: string, store: BoostStore, now = Date.now()): BoostStore {
  if (!canBoost(domain, store, now)) return store;
  return {
    lastBoostAt: {
      ...store.lastBoostAt,
      [domain]: now,
    },
    counts: {
      ...store.counts,
      [domain]: (store.counts[domain] ?? 0) + 1,
    },
  };
}
