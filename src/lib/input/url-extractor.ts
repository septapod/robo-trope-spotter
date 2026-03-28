import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const FETCH_TIMEOUT_MS = 10_000;

const USER_AGENT =
  'Mozilla/5.0 (compatible; RoboTropeSpotter/1.0; +https://robotropes.dxn.is)';

/**
 * Fetches a URL and extracts article text using Mozilla Readability.
 *
 * Throws on LinkedIn URLs (they block automated reading),
 * non-readerable pages, and network/timeout errors.
 */
export async function extractFromUrl(
  url: string
): Promise<{ text: string; title: string; siteName: string | null }> {
  // Block LinkedIn URLs upfront
  const parsed = new URL(url);
  if (
    parsed.hostname === 'linkedin.com' ||
    parsed.hostname.endsWith('.linkedin.com')
  ) {
    throw new Error(
      'LinkedIn blocks automated reading. Please paste the text directly.'
    );
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL (HTTP ${response.status}): ${response.statusText}`
      );
    }

    html = await response.text();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('URL fetch timed out after 10 seconds.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  // Parse with JSDOM
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Check if the page is likely readerable
  if (!isProbablyReaderable(doc)) {
    throw new Error('Could not extract article text from this URL.');
  }

  // Extract with Readability
  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article || !article.textContent || article.textContent.trim().length === 0) {
    throw new Error('Could not extract article text from this URL.');
  }

  return {
    text: article.textContent.trim(),
    title: article.title ?? 'Untitled',
    siteName: article.siteName ?? null,
  };
}
