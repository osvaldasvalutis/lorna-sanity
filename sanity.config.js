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
import { AddIcon } from "@sanity/icons/Add"
import { internationalizedArray } from "sanity-plugin-internationalized-array"
import groq from "groq"

import { schemaTypes } from "./schemaTypes"

/**
 * Plain `S.list()` panes don't render `.initialValueTemplates()` (that's a
 * `documentList`/`documentTypeList`-only feature), so the "+ Create" button
 * has to be added as a menu item with a `create` intent instead. When
 * `parentId` is given, the new service is created via the `serviceWithParent`
 * template (see `schema.templates` below) so its `parent` field is
 * preselected to that main service.
 *
 * @param {import('sanity/structure').StructureBuilder} S
 * @param {string} [parentId]
 */
const createServiceMenuItem = (S, parentId) =>
  S.menuItem()
    .title(`Create new`)
    .icon(AddIcon)
    .intent({
      type: `create`,
      params: parentId
        ? [{ type: `service`, template: `serviceWithParent` }, { parentId }]
        : { type: `service` },
    })

/**
 * Builds the "Sub" services list as one group per main service (a service
 * with no `parent`), each opening a document list filtered to that main
 * service's children.
 *
 * @param {import('sanity/structure').StructureBuilder} S
 * @param {import('sanity').ConfigContext} context
 */
async function subServicesByMainService(S, context) {
  const client = context
    .getClient({ apiVersion: `2025-02-19` })
    .withConfig({ perspective: `drafts` })

  /** @type {{ _id: string, title?: string }[]} */
  const mainServices = await client.fetch(groq`
    *[_type == "service" && !defined(parent)] | order(defined(menuOrder) desc, menuOrder desc, title[0].value asc) {
      _id,
      "title": title[0].value
    }
  `)

  const byPublishedId = new Map()
  for (const service of mainServices) {
    const publishedId = getPublishedId(service._id)
    if (!byPublishedId.has(publishedId)) byPublishedId.set(publishedId, service)
  }

  const items = [...byPublishedId.values()]

  return S.list()
    .id(`services`)
    .title(`Services`)
    .items(
      items.map((service) => {
        const parentId = getPublishedId(service._id)
        return S.listItem()
          .id(parentId)
          .title(service.title || `(No title)`)
          .child(() =>
            mainServiceWithChildren(
              S,
              context,
              parentId,
              service.title || `(No title)`
            )
          )
      })
    )
    .menuItems([createServiceMenuItem(S)])
}

/**
 * Builds a single main service's group: the main service itself, followed
 * by its sub services.
 *
 * @param {import('sanity/structure').StructureBuilder} S
 * @param {import('sanity').ConfigContext} context
 * @param {string} parentId
 * @param {string} title
 */
async function mainServiceWithChildren(S, context, parentId, title) {
  const client = context
    .getClient({ apiVersion: `2025-02-19` })
    .withConfig({ perspective: `drafts` })

  /** @type {{ _id: string, title?: string }[]} */
  const children = await client.fetch(
    groq`*[_type == "service" && parent._ref == $parentId]{ _id, "title": title[0].value }`,
    { parentId }
  )

  const byPublishedId = new Map()
  for (const child of children) {
    const childId = getPublishedId(child._id)
    if (!byPublishedId.has(childId)) byPublishedId.set(childId, child)
  }

  const sortedChildren = [...byPublishedId.values()].sort((a, b) =>
    (a.title || ``).localeCompare(b.title || ``)
  )

  return S.list()
    .id(`services-sub-${parentId}`)
    .title(title)
    .items([
      S.documentListItem().id(parentId).schemaType(`service`).title(title),
      S.divider(),
      ...sortedChildren.map((child) => {
        const childId = getPublishedId(child._id)
        return S.documentListItem()
          .id(childId)
          .schemaType(`service`)
          .title(child.title || `(No title)`)
      }),
    ])
    .menuItems([createServiceMenuItem(S, parentId)])
}

export default defineConfig({
  name: `default`,
  title: `Lorna`,
  projectId: `la248zyx`,
  dataset: `production`,
  auth: {
    providers: [
      {
        name: `sanity`,
        title: `Email / Password`,
        url: `https://api.sanity.io/v1/auth/login/sanity`,
      },
    ],
    redirectOnSingle: true, // skips the provider-picker screen entirely
  },
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
      structure: (S, context) =>
        S.list()
          .title(`Content`)
          .items([
            S.listItem()
              .id(`services`)
              .title(`Services`)
              .icon(CaseIcon)
              .child(() => subServicesByMainService(S, context)),
            // S.listItem()
            //   .id(`services`)
            //   .title(`Services`)
            //   .icon(CaseIcon)
            //   .child(
            //     S.list()
            //       .id(`services`)
            //       .title(`Services`)
            //       .items([
            //         S.listItem()
            //           .id(`services-main`)
            //           .title(`Main`)
            //           .child(
            //             S.documentList()
            //               .id(`services-main-list`)
            //               .title(`Main services`)
            //               .schemaType(`service`)
            //               .filter(`_type == "service" && !defined(parent)`)
            //               .initialValueTemplates([
            //                 S.initialValueTemplateItem(`service`),
            //               ])
            //           ),
            //         S.listItem()
            //           .id(`services-sub`)
            //           .title(`Sub`)
            //           .child(() => subServicesByMainService(S, context)),
            //       ])
            //   ),
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
                        validation: (Rule) =>
                          Rule.uri({
                            scheme: [`https`, `tel`, `mailto`],
                            allowRelative: true,
                          }),
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
                      { title: `Full width`, value: `full-width` },
                      { title: `Half width`, value: `half-width` },
                    ],
                    layout: `radio`,
                  },
                  initialValue: `full-width`,
                },
                {
                  name: `linkToSelf`,
                  type: `boolean`,
                  initialValue: false,
                },
              ],
            }),
            // https://www.sanity.io/answers/how-to-add-an-react-hr-component-to-blockcontent-schema
            // https://www.sanity.io/recipes/breaks-for-portable-text-189dba35
            // defineArrayMember({
            //   name: `hr`,
            //   type: `object`,
            //   title: `Horizontal Rule`,
            //   fields: [
            //     {
            //       name: `style`,
            //       type: `string`,
            //       hidden: true,
            //       initialValue: `Horizontal Rule`,
            //       options: {
            //         list: [`break`, `readMore`],
            //       },
            //     },
            //   ],
            // }),
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
    templates: (prev) => [
      ...prev,
      {
        id: `serviceWithParent`,
        title: `Service`,
        schemaType: `service`,
        /** @param {{ parentId?: string }} params */
        value: (params) => ({
          parent: params?.parentId
            ? { _type: `reference`, _ref: params.parentId, _weak: true }
            : undefined,
        }),
      },
    ],
  },
})
