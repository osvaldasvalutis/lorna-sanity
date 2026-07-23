/**
 * @typedef {Object} LocalizedValue
 * @property {string} language
 * @property {string} value
 */

/**
 * @typedef {Object} DocumentPreviewSelection
 * @property {LocalizedValue[]} [title]
 * @property {{ language: string, value?: import('sanity').Slug }[]} [slug]
 * @property {import('sanity').Image} [image]
 * @property {boolean} [published]
 */

export const typePreview = {
  select: {
    title: `title`,
    slug: `slug`,
    image: `image`,
    published: `published`,
  },
  /** @param {DocumentPreviewSelection} selection */
  prepare(selection) {
    const slugLanguages = new Set(
      selection?.slug
        ?.filter((s) => s.value?.current && s.value.current != ``)
        .map((s) => s.language)
    )

    const languagesPublished = selection?.title
      ?.filter((t) => t.value && t.value != `` && slugLanguages.has(t.language))
      .map((t) => t.language.toUpperCase())
      .join(`, `)

    let subTitle = languagesPublished
    if (selection?.published === false)
      subTitle = `🛑 Unpublished / ${languagesPublished}`

    return {
      media: /** @type {any} */ (selection.image),
      title: selection?.title?.[0]?.value ?? `(No title)`,
      subtitle: subTitle,
    }
  },
}
