const MIN_TEXT_LENGTH = 50;

interface NormalizeInput {
  type: 'text' | 'url' | 'screenshot';
  content: string;
}

interface NormalizeResult {
  text: string;
  sourceUrl?: string;
}

/**
 * Routes raw user input to the correct extractor and validates the result.
 *
 * - "text": passes content through directly.
 * - "url": fetches and extracts article text via Readability.
 * - "screenshot": sends a base64 image to Claude for OCR.
 *
 * Throws if the resulting text is empty or shorter than 50 characters.
 */
export async function normalizeInput(input: NormalizeInput): Promise<NormalizeResult> {
  let text: string;
  let sourceUrl: string | undefined;

  switch (input.type) {
    case 'text': {
      text = input.content.trim();
      break;
    }

    case 'url': {
      const { extractFromUrl } = await import('./url-extractor');
      const extracted = await extractFromUrl(input.content.trim());
      text = extracted.text;
      sourceUrl = input.content.trim();
      break;
    }

    case 'screenshot': {
      // content is expected to be "mediaType;base64data"
      const separatorIndex = input.content.indexOf(';');
      if (separatorIndex === -1) {
        throw new Error(
          'Invalid screenshot format. Expected "mediaType;base64data".'
        );
      }
      const mediaType = input.content.slice(0, separatorIndex);
      const base64Data = input.content.slice(separatorIndex + 1);
      const { extractFromScreenshot } = await import('./screenshot-ocr');
      text = await extractFromScreenshot(base64Data, mediaType);
      break;
    }

    default: {
      throw new Error(`Unsupported input type: ${(input as NormalizeInput).type}`);
    }
  }

  if (!text || text.length < MIN_TEXT_LENGTH) {
    throw new Error(
      `Text is too short for analysis (minimum ${MIN_TEXT_LENGTH} characters). Got ${text?.length ?? 0}.`
    );
  }

  return { text, sourceUrl };
}
