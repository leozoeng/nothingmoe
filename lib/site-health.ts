export type SiteHealth = {
  status: "operational" | "degraded";
  latencyMs?: number;
  code?: number;
  message?: string;
};

export async function checkSiteHealth(url: string): Promise<SiteHealth> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (res.status >= 200 && res.status < 400) {
      return { status: "operational", latencyMs, code: res.status };
    }

    if (res.status >= 500) {
      return {
        status: "degraded",
        code: res.status,
        message: res.status === 523 ? "Origin unreachable (523)" : `HTTP ${res.status} error`,
        latencyMs,
      };
    }

    return { status: "operational", latencyMs, code: res.status };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return {
      status: "degraded",
      message: isTimeout ? "Connection timed out" : "Server unreachable",
      latencyMs,
    };
  }
}

export async function checkAllSitesHealth(
  sites: { href: string; slug: string }[]
): Promise<Record<string, SiteHealth>> {
  const results = await Promise.allSettled(
    sites.map(async (site) => {
      const health = await checkSiteHealth(site.href);
      return { slug: site.slug, health };
    })
  );

  const map: Record<string, SiteHealth> = {};
  for (const res of results) {
    if (res.status === "fulfilled") {
      map[res.value.slug] = res.value.health;
    }
  }
  return map;
}
