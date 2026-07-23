import {
  defineArrayMember,
  defineField,
  defineType,
  ALL_FIELDS_GROUP,
} from "sanity"
import { localizedTitleField } from "./fields/localizedTitleField"
import { localizedSlugField } from "./fields/localizedSlugField"
import { defineFilesField } from "./fields/filesField"
import { typePreview } from "./lib/typePreview"

/** @typedef {import('./lib/typePreview').LocalizedValue} LocalizedValue */

/**
 * @typedef {Object} PricePreviewSelection
 * @property {LocalizedValue[]} [name]
 * @property {number} [price]
 */

/**
 * @typedef {Object} ExpertPreviewSelection
 * @property {string} [fullname]
 * @property {LocalizedValue[]} [role]
 * @property {any} [media]
 */

export const serviceType = defineType({
  name: `service`,
  title: `Services`,
  type: `document`,
  groups: [
    {
      name: `main`,
      default: true,
    },
    {
      name: `prices`,
    },
    {
      name: `experts`,
    },
    {
      name: `gallery`,
    },
    {
      name: `files`,
    },
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
  ],
  fields: [
    localizedTitleField({ group: `main` }),
    localizedSlugField({ group: `main` }),
    defineField({
      name: `body`,
      group: `main`,
      type: `internationalizedArrayBlockContent`,
    }),
    defineField({
      name: `showAppointmentForm`,
      group: `main`,
      type: `boolean`,
      initialValue: true,
    }),
    defineField({
      name: `published`,
      group: `main`,
      type: `boolean`,
      initialValue: true,
    }),
    defineField({
      name: `prices`,
      group: `prices`,
      type: `array`,
      of: [
        defineArrayMember({
          type: `object`,
          name: `price`,
          fields: [
            { name: `name`, type: `internationalizedArrayString` },
            {
              name: `price`,
              type: `number`,
              validation: (rule) => rule.precision(2).positive(),
            },
          ],
          preview: {
            select: {
              name: `name`,
              price: `price`,
            },
            /** @param {PricePreviewSelection} selection */
            prepare(selection) {
              return {
                title: selection?.name?.[0]?.value || `(No name)`,
                subtitle:
                  selection?.price != null
                    ? String(selection.price)
                    : `(No price)`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: `experts`,
      group: `experts`,
      type: `array`,
      of: [
        defineArrayMember({
          type: `object`,
          name: `expert`,
          fields: [
            {
              name: `fullname`,
              type: `string`,
            },
            {
              name: `role`,
              type: `internationalizedArrayString`,
            },
            {
              name: `image`,
              type: `image`,
            },
            {
              name: `body`,
              type: `internationalizedArrayBlockContent`,
            },
          ],
          preview: {
            select: {
              fullname: `fullname`,
              role: `role`,
              media: `image`,
            },
            /** @param {ExpertPreviewSelection} selection */
            prepare(selection) {
              return {
                title: selection?.fullname || `(No name)`,
                media: selection?.media,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: `gallery`,
      group: `gallery`,
      type: `array`,
      of: [
        defineArrayMember({
          type: `image`,
          name: `image`,
          fields: [
            { name: `description`, type: `internationalizedArrayString` },
          ],
        }),
      ],
    }),
    defineFilesField({ group: `files` }),
  ],
  preview: {
    ...typePreview,
  },
})
