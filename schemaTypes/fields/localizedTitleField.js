import { defineField } from "sanity"

/** @typedef {import('../lib/typePreview').LocalizedValue} LocalizedValue */

/**
 * @param {Partial<import('sanity').FieldDefinition>} [overrides]
 * @returns {import('sanity').FieldDefinition}
 */
export const localizedTitleField = (overrides = {}) =>
  defineField({
    name: `title`,
    type: `internationalizedArrayString`,
    validation: (rule) =>
      rule.custom(
        /** @param {LocalizedValue[]} value */
        (value) => {
          if (
            !value ||
            !value.find((v) => v.language == `lt` && v.value && v.value != ``)
          )
            return `Title in default language is required`

          return true
        }
      ),
    ...overrides,
  })
