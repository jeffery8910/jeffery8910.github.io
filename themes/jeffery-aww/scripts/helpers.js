/* global hexo */
// Template helpers and generators for the jeffery-aww theme.

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const plain = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// Wraps each character in a mask so CSS can raise them one by one.
hexo.extend.helper.register('split_chars', (text, delay = 0, step = 0.04) => {
  const chars = [...String(text || '')]
  const inner = chars
    .map((ch, i) => {
      const glyph = ch === ' ' ? '&nbsp;' : escape(ch)
      return `<span class="m" aria-hidden="true"><span class="c" style="--d:${(delay + i * step).toFixed(3)}s">${glyph}</span></span>`
    })
    .join('')
  return `<span class="split" aria-label="${escape(text)}">${inner}</span>`
})

// Two-digit index such as 01, 02.
hexo.extend.helper.register('pad2', (n) => String(n).padStart(2, '0'))

// Rough reading time for Chinese and English mixed text.
hexo.extend.helper.register('read_minutes', (content) => {
  const text = plain(content)
  const cjk = (text.match(/[一-鿿]/g) || []).length
  const words = (text.replace(/[一-鿿]/g, ' ').match(/\S+/g) || []).length
  return Math.max(1, Math.round(cjk / 400 + words / 220))
})

// First sentence or so of a post, for list rows.
hexo.extend.helper.register('teaser', (content, length = 58) => {
  const text = plain(content)
  return text.length > length ? text.slice(0, length) + '…' : text
})

// Small inline icons: a light, water, and the horizon line.
const ICONS = {
  sun: '<circle cx="24" cy="24" r="9"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.9 9.9l4.2 4.2M33.9 33.9l4.2 4.2M9.9 38.1l4.2-4.2M33.9 14.1l4.2-4.2"/>',
  horizon: '<path d="M5 32h38"/><path d="M14 32a10 10 0 0 1 20 0"/><path d="M24 38v6"/>',
  drop: '<path d="M24 5C17 15 11 22 11 30a13 13 0 0 0 26 0c0-8-6-15-13-25Z"/><path d="M18 31a6 6 0 0 0 6 6"/>',
}
hexo.extend.helper.register('motif_icon', (name) =>
  `<svg class="icon icon--${name}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`
)

// posts.json: a small feed the 3D studio reads to list the latest writing.
hexo.extend.generator.register('posts_json', (locals) => {
  const posts = locals.posts.sort('-date').map((post) => ({
    title: post.title,
    url: post.permalink,
    date: post.date.format('YYYY-MM-DD'),
    tags: post.tags.map((tag) => tag.name),
    excerpt: plain(post.content).slice(0, 64),
  }))
  return { path: 'posts.json', data: JSON.stringify(posts) }
})
