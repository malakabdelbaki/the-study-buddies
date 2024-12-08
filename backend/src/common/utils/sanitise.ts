import * as sanitizeHtml from 'sanitize-html';

// * Sanitizes a string to remove control characters and scripts.
// * @param input - The string to sanitize.
// * @returns - The sanitized string.

export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {}, // Strip all attributes
  });
}