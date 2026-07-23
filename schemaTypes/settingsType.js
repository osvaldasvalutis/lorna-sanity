import { defineField, defineType } from "sanity"

export const settingsType = defineType({
  name: `settings`,
  title: `Settings`,
  type: `document`,
  fields: [
    defineField({ name: `title`, type: `string` }),
    defineField({ name: `description`, type: `text` }),
    defineField({ name: `email`, type: `email` }),
  ],
  preview: {
    prepare() {
      return {
        title: `Settings`,
      }
    },
  },
})
