import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
const MIN_TEXT_LENGTH = 20;
const OCR_TIMEOUT_MS = 8_000; // 8s — must fit within Vercel 10s with room for DB write

const VALID_MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

const OCR_PROMPT = `Extract ALL visible text from this image exactly as it appears.
Preserve paragraph breaks. Do not summarize, interpret, or add commentary.
Return only the extracted text.`;

/**
 * Sends a base64-encoded image to Claude for OCR text extraction.
 *
 * @param imageBase64 - The base64-encoded image data (no data URI prefix).
 * @param mediaType   - MIME type, e.g. "image/png" or "image/jpeg".
 * @returns The extracted text content.
 */
export async function extractFromScreenshot(
  imageBase64: string,
  mediaType: string
): Promise<string> {
  if (!VALID_MEDIA_TYPES.has(mediaType)) {
    throw new Error(`Unsupported image type: ${mediaType}. Use PNG, JPEG, GIF, or WebP.`);
  }

  let response: Anthropic.Message;
  try {
    const client = new Anthropic();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);

    try {
      response = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
                    data: imageBase64,
                  },
                },
                {
                  type: 'text',
                  text: OCR_PROMPT,
                },
              ],
            },
          ],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Screenshot processing timed out. Try a smaller image or paste the text directly.');
    }
    const message =
      error instanceof Error ? error.message : 'Unknown API error';
    throw new Error(`Screenshot OCR failed: ${message}`);
  }

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Could not extract text from this image.');
  }

  const text = block.text.trim();
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('Could not extract text from this image.');
  }

  return text;
}
