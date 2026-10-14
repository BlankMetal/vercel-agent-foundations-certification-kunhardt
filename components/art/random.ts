// Deterministic randomness for generative art. Server and client must draw the
// same pattern for the same seed, or hydration mismatches.

function hashSeed(seed: string): number {
  // FNV-1a
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32: small, fast, and good enough for picking tiles.
export function createRandom(seed: string) {
  let a = hashSeed(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)];
    },
  };
}
