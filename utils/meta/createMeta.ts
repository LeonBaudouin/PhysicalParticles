const defaultMetas = {
  title: '',
  description: '',
  twitterImage: (APP_URL) => `${APP_URL}/socials/twitter.jpg`,
  facebookImage: (APP_URL) => `${APP_URL}/socials/facebook.jpg`,
}

export default function createMeta(
  baseUrl: string,
  {
    title = defaultMetas.title,
    description = defaultMetas.description,
    twitterImage = defaultMetas.twitterImage,
    facebookImage = defaultMetas.facebookImage,
  }: {
    title?: string
    description?: string
    twitterImage?: (APP_URL: string) => string
    facebookImage?: (APP_URL: string) => string
  } = {}
) {
  let desc = description.replace(/<\/?[^>]+(>|$)/g, '')
  desc = desc.length > 150 ? desc.substring(0, 150) + '...' : desc
  return [
    { hid: 'description', name: 'description', content: desc },
    { hid: 'og:description', name: 'og:description', content: desc },
    { hid: 'og:type', name: 'og:type', content: 'website' },
    { hid: 'og:title', name: 'og:title', content: title ? `${title}` : '' },
    { hid: 'og:site_name', name: 'og:site_name', content: title ? `${title}` : '' },
    { hid: 'og:locale', name: 'og:locale', content: 'en' },
    { hid: 'og:image', name: 'og:image', content: facebookImage(baseUrl) },
    { hid: 'twitter:image', name: 'twitter:image', content: twitterImage(baseUrl) },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:creator', name: 'twitter:creator', content: '@BaudouinLeon' },
  ]
}
