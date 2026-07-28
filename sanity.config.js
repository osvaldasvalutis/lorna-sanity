import {
  defineArrayMember,
  defineConfig,
  defineField,
  getPublishedId,
} from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { CogIcon } from "@sanity/icons/Cog"
import { CaseIcon } from "@sanity/icons/Case"
import { DocumentIcon } from "@sanity/icons/Document"
import { BookIcon } from "@sanity/icons/Book"
import { internationalizedArray } from "sanity-plugin-internationalized-array"
import groq from "groq"

import { schemaTypes } from "./schemaTypes"

export default defineConfig({
  name: `default`,
  title: `Lorna`,
  projectId: `la248zyx`,
  dataset: `production`,
  document: {
    drafts: {
      // enabled: false,
    },
    actions: (prev, { schemaType }) => {
      if (schemaType === `settings`) {
        return prev.filter(
          ({ action }) =>
            action && [`publish`, `discardChanges`, `restore`].includes(action)
        )
      }
      return prev
    },
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === `global`) {
        return prev.filter((item) => item.templateId !== `settings`)
      }
      return prev
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title(`Content`)
          .items([
            S.listItem()
              .id(`services`)
              .title(`Services`)
              .icon(CaseIcon)
              .child(
                S.list()
                  .id(`services`)
                  .title(`Services`)
                  .items([
                    S.listItem()
                      .id(`services-main`)
                      .title(`Main`)
                      .child(
                        S.documentList()
                          .id(`services-main-list`)
                          .title(`Main services`)
                          .schemaType(`service`)
                          .filter(`_type == "service" && !defined(parent)`)
                          .initialValueTemplates([
                            S.initialValueTemplateItem(`service`),
                          ])
                      ),
                    S.listItem()
                      .id(`services-sub`)
                      .title(`Sub`)
                      .child(
                        S.documentList()
                          .id(`services-sub-list`)
                          .title(`Sub services`)
                          .schemaType(`service`)
                          .filter(`_type == "service" && defined(parent)`)
                          .initialValueTemplates([
                            S.initialValueTemplateItem(`service`),
                          ])
                      ),
                  ])
              ),
            S.documentTypeListItem(`page`).title(`Pages`).icon(DocumentIcon),
            S.documentTypeListItem(`article`).title(`Articles`).icon(BookIcon),
            S.documentTypeListItem(`news`).title(`News`).icon(BookIcon),
            S.divider(),
            S.listItem()
              .title(`Settings`)
              .icon(CogIcon)
              .child(
                S.document().schemaType(`settings`).documentId(`settings`)
              ),
          ]),
    }),
    visionTool(),
    internationalizedArray({
      buttonAddAll: false,
      defaultLanguages: [`lt`],
      languages: [
        { id: `lt`, title: `Lithuanian` },
        { id: `en`, title: `English` },
        { id: `ru`, title: `Russian` },
      ],
      fieldTypes: [
        `string`,
        defineField({
          name: `slug`,
          type: `slug`,
          options: {
            maxLength: 96,
            source: (doc, context) => {
              const { language } = /** @type {{ language?: string }} */ (
                context.parent
              )
              const titles =
                /** @type {{ language: string, value?: string }[] | undefined} */ (
                  doc?.title
                )
              return titles?.find((t) => t.language == language)?.value || ``
            },
            isUnique: async (slug, context) => {
              const { document, parent, path, getClient } = context
              const { language } = /** @type {{ language?: string }} */ (parent)
              const fieldName = path?.[0]
              if (!document?._id || !slug || !fieldName) return true

              const client = getClient({ apiVersion: `2025-02-19` })
              return (
                (await client.fetch(
                  groq`
                  !defined(*[
                    !sanity::versionOf($published) &&
                    _type in select($type in ["service", "page"] => ["service", "page"], [$type]) && // must be unique in service+page otherwise only in the same type
                    count(${fieldName}[language == $language && value.current == $slug]) > 0
                  ][0]._id)
                `,
                  {
                    published: getPublishedId(document._id),
                    type: document._type,
                    language,
                    slug,
                  }
                )) || false
              )
            },
          },
        }),
        defineField({
          name: `blockContent`,
          type: `array`,
          of: [
            defineArrayMember({
              type: `block`,
              styles: [
                { title: `Normal`, value: `normal` },
                { title: `H2`, value: `h2` },
                { title: `H3`, value: `h3` },
                { title: `Quote`, value: `blockquote` },
              ],
              lists: [
                { title: `Bullet`, value: `bullet` },
                { title: `Numbered`, value: `number` },
              ],
              marks: {
                decorators: [
                  { title: `Strong`, value: `strong` },
                  { title: `Emphasis`, value: `em` },
                ],
                annotations: [
                  {
                    title: `URL`,
                    name: `link`,
                    type: `object`,
                    fields: [
                      {
                        title: `URL`,
                        name: `href`,
                        type: `url`,
                      },
                    ],
                  },
                  // {
                  //   name: "article",
                  //   title: "Article",
                  //   type: "reference",
                  //   to: { type: "article" },
                  // },
                ],
              },
            }),
            defineArrayMember({
              type: `image`,
              fields: [
                {
                  title: `Caption`,
                  name: `caption`,
                  type: `string`,
                },
                {
                  title: `Size`,
                  name: `size`,
                  type: `string`,
                  options: {
                    list: [
                      { title: `Thumbnail`, value: `thumbnail` },
                      { title: `Full width`, value: `full-width` },
                    ],
                    layout: `radio`,
                  },
                  initialValue: `full-width`,
                },
              ],
            }),
            // defineArrayMember({
            //   type: "reference",
            //   name: "article",
            //   title: "Article",
            //   to: { type: "article" },
            // }),
          ],
        }),
      ],
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
