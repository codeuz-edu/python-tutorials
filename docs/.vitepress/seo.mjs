// What each page tells search engines, link previews and AI tools in its <head>: the canonical
// address, the Open Graph and Twitter card tags with the site's preview image, links between the
// Uzbek and English copies of a page, the author, and on a course's home page a schema.org Course.
//
// The same file is in every codeuz course repository (python-tutorials, python-advanced,
// data-structures-and-algorithms, algorithms-roadmap, physics-playground). Keep the copies alike;
// each site passes its own settings in from its config.mjs.

export const author = { '@type': 'Person', name: 'Yakhyokhuja Valikhujaev', url: 'https://yakhyo.github.io/' }
// The same organisation the home page (codeuz-edu.github.io) describes, under the same @id.
export const organization = {
 '@type': 'Organization', '@id': 'https://codeuz-edu.github.io/#organization', name: 'codeuz', url: 'https://codeuz-edu.github.io/',
 logo: 'https://codeuz-edu.github.io/icon.png',
 sameAs: ['https://github.com/codeuz-edu', 'https://youtube.com/@codeuz']
}
const LOCALES = { uz: 'uz_UZ', en: 'en_US' }

/**
 * @param {object} site
 * @param {string} site.url            the site's address, ending in '/'
 * @param {string} site.name           the course name, for og:site_name
 * @param {{ path: string, width: number, height: number, alt: string }} site.image
 *                                     the link preview image, a file under docs/public
 * @param {Record<string, string>} site.languages
 *                                     language code -> folder of that language's pages ('' for the site root)
 * @param {string} site.defaultLanguage  the language a visitor gets when theirs is not there (hreflang x-default)
 * @param {Record<string, string>} site.homes
 *                                     each home page (its path under docs/) -> the course name in that page's language
 * @param {string} [site.redirectRoot] where the bare site root sends visitors, when it only redirects
 */
export function seo(site) {
 const pageUrl = relativePath => site.url + relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
 // Longest folder first, so 'uz/' is tried before the site root ('').
 const folders = Object.entries(site.languages).sort((a, b) => b[1].length - a[1].length)
 const languageOf = path => (folders.find(([, folder]) => path.startsWith(folder)) || [site.defaultLanguage])[0]
 const image = site.url + site.image.path
 // Pages whose original is another address (the redirecting root, moved pages). The sitemap lists
 // only originals; transformHead fills this while pages are rendered, before the sitemap is written.
 const elsewhere = new Set()
 const sitemapPath = relativePath => pageUrl(relativePath).slice(site.url.length)

 return {
  // For config.mjs: sitemap: { hostname, transformItems: site.sitemapItems }
  sitemapItems: items => items.filter(item => !elsewhere.has(item.url)),

  head: [
   ['meta', { name: 'author', content: author.name }],
   ['link', { rel: 'author', href: author.url }],
   ['meta', { property: 'og:type', content: 'website' }],
   ['meta', { property: 'og:site_name', content: site.name }],
   ['meta', { property: 'og:image', content: image }],
   ['meta', { property: 'og:image:width', content: String(site.image.width) }],
   ['meta', { property: 'og:image:height', content: String(site.image.height) }],
   ['meta', { property: 'og:image:alt', content: site.image.alt }],
   ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  transformHead({ pageData, siteConfig, title, description }) {
   const path = pageData.relativePath
   if (pageData.isNotFound || path === '404.md') return []
   // The bare site root only sends visitors on: it names the page it sends them to as the original.
   if (site.redirectRoot && path === 'index.md') {
    elsewhere.add(sitemapPath(path))
    return [['link', { rel: 'canonical', href: site.redirectRoot }]]
   }
   // A page that moved names its new address itself, in its frontmatter.
   if ((pageData.frontmatter.head || []).some(([tag, attrs]) => tag === 'link' && attrs?.rel === 'canonical')) {
    elsewhere.add(sitemapPath(path))
    return []
   }

   const url = pageUrl(path)
   const language = languageOf(path)
   const tags = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:title', content: pageData.title || title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:locale', content: LOCALES[language] }]
   ]

   // The same page in the other language, where there is one.
   const pages = new Set(siteConfig.pages.map(page => siteConfig.rewrites.map[page] || page))
   const rest = path.slice(site.languages[language].length)
   const copies = Object.entries(site.languages).map(([lang, folder]) => [lang, folder + rest]).filter(([, other]) => pages.has(other))
   if (copies.length > 1) {
    for (const [lang, other] of copies) {
     tags.push(['link', { rel: 'alternate', hreflang: lang, href: pageUrl(other) }])
     if (lang !== language) tags.push(['meta', { property: 'og:locale:alternate', content: LOCALES[lang] }])
    }
    const fallback = copies.find(([lang]) => lang === site.defaultLanguage)
    if (fallback) tags.push(['link', { rel: 'alternate', hreflang: 'x-default', href: pageUrl(fallback[1]) }])
   }

   const course = site.homes[path]
   if (course) {
    tags.push(['script', { type: 'application/ld+json' }, JSON.stringify({
     '@context': 'https://schema.org', '@type': 'Course',
     name: course, description, url, inLanguage: language, image, author, provider: organization
    })])
   }
   return tags
  }
 }
}
