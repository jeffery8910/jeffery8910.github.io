// jeffery-aww: loader, water curtain between pages, scroll reveals, click ripples and the trailing cursor.
(function () {
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const curtain = document.querySelector('[data-curtain]')

  function startPage() {
    root.classList.add('is-ready')
  }

  // ---- loader (home page, once per visit) ----
  const loader = document.querySelector('[data-loader]')
  if (loader && !sessionStorage.getItem('aww-loaded') && !reduced) {
    sessionStorage.setItem('aww-loaded', '1')
    const bar = loader.querySelector('[data-loader-bar]')
    const count = loader.querySelector('[data-loader-count]')
    const line = loader.querySelector('[data-loader-line]')
    const lines = ['天色正在變', '點一盞燈', '等水面靜下來', '請進']
    const start = performance.now()
    const duration = 1700
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const v = Math.round((1 - Math.pow(1 - t, 3)) * 100)
      count.textContent = String(v).padStart(3, '0')
      bar.style.transform = 'scaleX(' + v / 100 + ')'
      line.textContent = lines[Math.min(lines.length - 1, Math.floor((v / 100) * lines.length))]
      if (t < 1) return requestAnimationFrame(tick)
      loader.classList.add('is-leaving')
      setTimeout(() => {
        loader.remove()
        startPage()
      }, 700)
    }
    requestAnimationFrame(tick)
  } else {
    if (loader) loader.remove()
    // Arriving from another page: the water that covered the last page drains upward.
    if (sessionStorage.getItem('aww-transition') && curtain && !reduced) {
      sessionStorage.removeItem('aww-transition')
      curtain.classList.add('is-covering', 'no-anim')
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          curtain.classList.remove('no-anim', 'is-covering')
          curtain.classList.add('is-leaving')
          startPage()
        })
      )
    } else {
      startPage()
    }
  }

  // ---- page transitions: water rises before leaving ----
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a')
    if (!a || reduced || !curtain) return
    const url = new URL(a.href, location.href)
    const internal = url.origin === location.origin && !a.target && !a.hasAttribute('download')
    const samePageHash = url.pathname === location.pathname && url.hash
    if (!internal || samePageHash || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    sessionStorage.setItem('aww-transition', '1')
    // Snap back below the screen first, then let it rise.
    curtain.classList.add('no-anim')
    curtain.classList.remove('is-leaving')
    void curtain.offsetHeight
    curtain.classList.remove('no-anim')
    curtain.classList.add('is-covering')
    setTimeout(() => (location.href = url.href), 800)
  })
  // Restore state when coming back via the back button (bfcache).
  addEventListener('pageshow', (e) => {
    if (e.persisted && curtain) {
      curtain.classList.add('no-anim')
      curtain.classList.remove('is-covering', 'is-leaving')
      requestAnimationFrame(() => curtain.classList.remove('no-anim'))
    }
  })

  // ---- a ripple wherever you click, like touching water ----
  if (!reduced) {
    addEventListener('pointerdown', (e) => {
      for (let i = 0; i < 2; i++) {
        const ring = document.createElement('span')
        ring.className = 'ripple'
        ring.style.left = e.clientX + 'px'
        ring.style.top = e.clientY + 'px'
        document.body.appendChild(ring)
        ring.addEventListener('animationend', () => ring.remove())
      }
    })
  }

  // ---- scroll reveals ----
  const prose = document.querySelector('[data-prose]')
  if (prose) {
    Array.from(prose.children).forEach((el) => el.setAttribute('data-reveal', ''))
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  )
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

  // ---- nav shrinks once you scroll ----
  const nav = document.querySelector('.nav')
  let lastY = 0
  addEventListener(
    'scroll',
    () => {
      const y = scrollY
      nav.classList.toggle('is-scrolled', y > 40)
      nav.classList.toggle('is-hidden', y > lastY && y > 300)
      lastY = y
    },
    { passive: true }
  )

  // ---- the sun drifts a little with the pointer ----
  const sun = document.querySelector('.hero__sun')
  if (sun && !reduced) {
    addEventListener('pointermove', (e) => {
      const x = (e.clientX / innerWidth - 0.5) * -50
      const y = (e.clientY / innerHeight - 0.5) * -50
      sun.style.translate = x + 'px ' + y + 'px'
    })
  }

  // ---- cursor (fine pointers only) ----
  if (!matchMedia('(pointer: fine)').matches) return
  root.classList.add('has-cursor')
  const ring = document.querySelector('[data-cursor]')
  const dot = document.querySelector('[data-cursor-dot]')
  const label = document.querySelector('[data-cursor-label]')
  const pos = { x: innerWidth / 2, y: innerHeight / 2 }
  const ringPos = { x: pos.x, y: pos.y }
  addEventListener('pointermove', (e) => {
    pos.x = e.clientX
    pos.y = e.clientY
    const withText = e.target.closest('[data-cursor-text]')
    const clickable = e.target.closest('a, button')
    ring.classList.toggle('is-text', !!withText)
    ring.classList.toggle('is-ui', !!clickable && !withText)
    label.textContent = withText ? withText.getAttribute('data-cursor-text') : ''
  })
  ;(function loop() {
    ringPos.x += (pos.x - ringPos.x) * 0.18
    ringPos.y += (pos.y - ringPos.y) * 0.18
    ring.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0)'
    dot.style.transform = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)'
    requestAnimationFrame(loop)
  })()
})()
