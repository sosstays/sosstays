// Uplisting's documented limit is 15 requests/min/property. Spacing calls
// this far apart keeps a single property's sync comfortably under that
// even with retries, without needing a token-bucket / queue library.
export const MIN_MS_BETWEEN_REQUESTS_PER_PROPERTY = 4_500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
