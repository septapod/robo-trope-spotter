import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { parseHTML } from 'linkedom';

const FETCH_TIMEOUT_MS = 5_000;

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
  const parsed = new URL(url);

  // Block non-HTTP schemes (file://, ftp://, etc.)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  // Block private/internal network addresses (SSRF protection)
  const hostname = parsed.hostname.toLowerCase();
  const privatePatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^\[::1\]$/,
    /^\[fd/,
    /^\[fe80:/,
  ];
  if (privatePatterns.some((p) => p.test(hostname))) {
    throw new Error('URLs targeting private or internal networks are not allowed.');
  }

  // Block LinkedIn URLs (they block automated reading)
  if (
    hostname === 'linkedin.com' ||
    hostname.endsWith('.linkedin.com')
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
      throw new Error('URL fetch timed out after 5 seconds. Try pasting the text directly.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  // Parse with linkedom (lightweight, no ESM compatibility issues on Vercel)
  const { document: doc } = parseHTML(html);

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
