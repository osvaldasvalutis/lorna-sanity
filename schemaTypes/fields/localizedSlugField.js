import { defineField } from "sanity"

/**
 * @typedef {Object} LocalizedSlugValue
 * @property {string} language
 * @property {import('sanity').Slug} [value]
 */

/**
 * @param {Partial<import('sanity').FieldDefinition>} [overrides]
 * @returns {import('sanity').FieldDefinition}
 */
export const localizedSlugField = (overrides = {}) =>
  defineField({
    name: `slug`,
    type: `internationalizedArraySlug`,
    validation: (rule) =>
      rule.custom(
        /** @param {LocalizedSlugValue[]} value */
        (value) => {
          if (
            !value ||
            !value.find(
              (v) =>
                v.language == `lt` && v.value?.current && v.value.current != ``
            )
          )
            return `Slug in default language is required`

          return true
        }
      ),
    ...overrides,
  })
