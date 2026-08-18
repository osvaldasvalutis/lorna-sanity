import { defineField, defineType } from "sanity"
import { localizedTitleField } from "./fields/localizedTitleField"
import { localizedSlugField } from "./fields/localizedSlugField"
// import { defineFilesField } from "./fields/filesField"
import { typePreview } from "./lib/typePreview"

export const newsType = defineType({
  name: `news`,
  title: `News`,
  type: `document`,
  fields: [
    localizedTitleField(),
    localizedSlugField(),
    defineField({
      name: `publishedAt`,
      type: `datetime`,
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: `image`,
      type: `image`,
    }),
    defineField({
      name: `body`,
      type: `internationalizedArrayBlockContent`,
    }),
    // defineFilesField(),
    defineField({
      name: `published`,
      type: `boolean`,
      initialValue: true,
    }),
  ],
  preview: {
    ...typePreview,
  },
})
