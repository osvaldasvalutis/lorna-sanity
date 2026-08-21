import slugifyLib from "slugify"

/**
 * Slugify that transliterates Lithuanian diacritics (e.g. "ė" -> "e") instead
 * of dropping them, so "Nuotolinės" becomes "nuotolines" rather than "nuotolin-s".
 *
 * @param {string} input
 * @param {import('sanity').SlugSourceContext} [_context]
 * @param {number} [maxLength]
 */
export const slugify = (input, _context, maxLength = 200) =>
  slugifyLib(input, { lower: true, strict: true }).slice(0, maxLength)
