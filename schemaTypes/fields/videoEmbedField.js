import { createElement } from "react"
import { defineArrayMember, defineField } from "sanity"
import { PlayIcon } from "@sanity/icons/Play"
import { Flex, Text } from "@sanity/ui"
import getVideoId from "get-video-id"

// YouTube embed params: https://developers.google.com/youtube/player_parameters#Parameters
// Vimeo embed params: https://help.vimeo.com/hc/en-us/articles/12426260232977-Player-parameters-overview
/** @param {string} url */
function fixVideoEmbedUrl(url) {
  const { id, service } = getVideoId(url)
  if (!id) return null

  // No `enablejsapi`/`api` here: this is only a static Studio preview, no
  // programmatic play/pause/mute control needed, and `enablejsapi` requires
  // a real parent-window postMessage handshake to initialize — which is
  // finicky to guarantee inside the Studio's own iframe rendering.
  switch (service) {
    case `youtube`:
      return `https://www.youtube-nocookie.com/embed/${id}`
    case `vimeo`:
      return `https://player.vimeo.com/video/${id}?dnt=1`
    default:
      return null
  }
}

/** @param {import('sanity').PreviewProps} props */
function VideoEmbedPreview(props) {
  // eslint-disable-next-line react/prop-types -- no PropTypes usage in this codebase; type is documented via JSDoc above
  const { title: url } = props
  const embedUrl = typeof url === `string` ? fixVideoEmbedUrl(url) : null

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
          Rule.required().custom((url) => {
            if (!url) return true
            const { id, service } = getVideoId(url)
            return (
              (id && (service === `youtube` || service === `vimeo`)) ||
              `Only YouTube or Vimeo URLs are allowed`
            )
          }),
      }),
    ],
    preview: {
      select: { title: `url` },
    },
    components: {
      preview: VideoEmbedPreview,
    },
  })
