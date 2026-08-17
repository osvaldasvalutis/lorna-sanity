import { defineArrayMember, defineField } from "sanity"

export const defineFilesField = (overrides = {}) =>
  defineField({
    name: `files`,
    type: `array`,
    of: [
      defineArrayMember({
        type: `file`,
        options: {
          accept: `application/pdf`,
        },
        fields: [
          {
            name: `title`,
            type: `internationalizedArrayString`,
          },
        ],
        preview: {
          select: {
            title: `title`,
            fileName: `asset.originalFilename`,
          },
          prepare(selection) {
            return {
              title:
                selection?.title?.[0]?.value ||
                selection?.fileName ||
                `(No title)`,
              subtitle: selection?.fileName,
            }
          },
        },
      }),
    ],
    ...overrides,
  })
