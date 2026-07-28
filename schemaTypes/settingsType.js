import { defineField, defineType, defineArrayMember } from "sanity"

export const settingsType = defineType({
  name: `settings`,
  title: `Settings`,
  type: `document`,
  fields: [
    // defineField({ name: `title`, type: `string` }),
    // defineField({ name: `description`, type: `text` }),
    // defineField({ name: `email`, type: `email` }),
    defineField({
      name: `homeGallery`,
      type: `array`,
      of: [
        defineArrayMember({
          type: `image`,
          name: `image`,
          fields: [
            { name: `title`, type: `internationalizedArrayString` },
            { name: `description`, type: `internationalizedArrayString` },
            { name: `link`, type: `internationalizedArrayString` },
            {
              name: `relation`,
              type: `reference`,
              weak: true,
              to: [
                { type: `service` },
                { type: `page` },
                { type: `article` },
                { type: `news` },
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: `contactGallery`,
      type: `array`,
      of: [
        defineArrayMember({
          type: `image`,
          name: `image`,
          fields: [
            { name: `title`, type: `internationalizedArrayString` },
            { name: `description`, type: `internationalizedArrayString` },
            { name: `link`, type: `internationalizedArrayString` },
            {
              name: `relation`,
              type: `reference`,
              weak: true,
              to: [
                { type: `service` },
                { type: `page` },
                { type: `article` },
                { type: `news` },
              ],
            },
          ],
        }),
      ],
    }),
    // defineField({
    //   name: `menu`,
    //   type: `array`,
    //   of: [
    //     {
    //       type: `object`,
    //       name: `menuLink`,
    //       fields: [
    //         defineField({
    //           name: `linkType`,
    //           type: `string`,
    //           options: {
    //             list: [
    //               { title: `Internal`, value: `internal` },
    //               { title: `External`, value: `external` },
    //             ],
    //             layout: `radio`,
    //           },
    //           initialValue: `internal`,
    //         }),
    //         defineField({
    //           name: `internalLink`,
    //           type: `reference`,
    //           weak: true,
    //           to: [{ type: `page` }, { type: `article` }],
    //           hidden: ({ parent }) => parent?.linkType !== `internal`,
    //         }),
    //         defineField({
    //           name: `externalLink`,
    //           type: `url`,
    //           hidden: ({ parent }) => parent?.linkType !== `external`,
    //         }),
    //         defineField({
    //           name: `label`,
    //           type: `string`,
    //           description: `Optional custom label; falls back to the linked document's title`,
    //         }),
    //       ],
    //       preview: {
    //         select: {
    //           linkType: `linkType`,
    //           internalTitle: `internalLink.title`,
    //           external: `externalLink`,
    //           label: `label`,
    //         },
    //         prepare({ linkType, internalTitle, external, label }) {
    //           return {
    //             title: label || (linkType === `internal` ? internalTitle : external) || `Untitled link`,
    //             subtitle: linkType,
    //           }
    //         },
    //       },
    //     },
    //   ],
    // }),
  ],
  preview: {
    prepare() {
      return {
        title: `Settings`,
      }
    },
  },
})
