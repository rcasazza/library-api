/**
 * Safely trims all string fields in request.body.
 * Skips undefined, null, and non-string values.
 */
export async function preValidationTrim(request) {
  try {
    const body = request.body;
    console.log('[trim] raw body =', body);

    if (!body || typeof body !== 'object') return;

    for (const key in body) {
      const value = body[key];
      if (typeof value === 'string') {
        body[key] = value.trim();
      }
    }
  } catch (err) {
    console.error('[trim] failed:', err);
    throw err;
  }
}
