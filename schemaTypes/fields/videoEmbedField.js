import { createElement } from "react"
import { defineArrayMember, defineField } from "sanity"
import { PlayIcon } from "@sanity/icons/Play"
import { Flex, Text } from "@sanity/ui"

const VIDEO_URL_PATTERN =
  /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)\//i

const YOUTUBE_ID_PATTERN =
  /youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([\w-]{11})|youtu\.be\/([\w-]{11})/
const VIMEO_ID_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/

/** @param {string} url */
function getEmbedUrl(url) {
  const youtubeMatch = url.match(YOUTUBE_ID_PATTERN)
  if (youtubeMatch)
    return `https://www.youtube.com/embed/${youtubeMatch[1] || youtubeMatch[2]}`

  const vimeoMatch = url.match(VIMEO_ID_PATTERN)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}

/** @param {import('sanity').PreviewProps} props */
function VideoEmbedPreview(props) {
  // eslint-disable-next-line react/prop-types -- no PropTypes usage in this codebase; type is documented via JSDoc above
  const { title: url } = props
  const embedUrl = typeof url === `string` ? getEmbedUrl(url) : null

  return createElement(
    Flex,
    { padding: 3, align: `center`, justify: `center` },
    embedUrl
      ? createElement(`iframe`, {
          src: embedUrl,
          width: `100%`,
          height: 160,
          style: { border: 0 },
          allow: `autoplay; fullscreen; picture-in-picture`,
          allowFullScreen: true,
        })
      : createElement(Text, null, `Add a YouTube or Vimeo URL`)
  )
}

export const defineVideoEmbedMember = () =>
  defineArrayMember({
    type: `object`,
    name: `videoEmbed`,
    title: `Video embed (YouTube / Vimeo)`,
    icon: PlayIcon,
    fields: [
      defineField({
        name: `url`,
        title: `Video URL`,
        type: `url`,
        validation: (Rule) =>
          Rule.required().custom((url) =>
            !url || VIDEO_URL_PATTERN.test(url)
              ? true
              : `Only YouTube or Vimeo URLs are allowed`
          ),
      }),
    ],
    preview: {
      select: { title: `url` },
    },
    components: {
      preview: VideoEmbedPreview,
    },
  })
