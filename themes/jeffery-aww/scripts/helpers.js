/* global hexo */
// Template helpers for the jeffery-aww theme.

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

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
  const text = String(content || '').replace(/<[^>]+>/g, '')
  const cjk = (text.match(/[一-鿿]/g) || []).length
  const words = (text.replace(/[一-鿿]/g, ' ').match(/\S+/g) || []).length
  return Math.max(1, Math.round(cjk / 400 + words / 220))
})
