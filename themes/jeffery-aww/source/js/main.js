// jeffery-aww: loader, page-transition curtain, scroll reveals and the trailing cursor.
(function () {
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---- loader (home page, once per visit) ----
  const loader = document.querySelector('[data-loader]')
  function startPage() {
    root.classList.add('is-ready')
  }
  if (loader && !sessionStorage.getItem('aww-loaded') && !reduced) {
    sessionStorage.setItem('aww-loaded', '1')
    const bar = loader.querySelector('[data-loader-bar]')
    const count = loader.querySelector('[data-loader-count]')
    const start = performance.now()
    const duration = 1500
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const v = Math.round((1 - Math.pow(1 - t, 3)) * 100)
      count.textContent = String(v).padStart(3, '0')
      bar.style.transform = 'scaleX(' + v / 100 + ')'
      if (t < 1) return requestAnimationFrame(tick)
      loader.classList.add('is-leaving')
      setTimeout(() => {
        loader.remove()
        startPage()
      }, 650)
    }
    requestAnimationFrame(tick)
  } else {
    if (loader) loader.remove()
    // Arriving from another page: lift the curtain that covered the previous one.
    const curtain = document.querySelector('[data-curtain]')
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

  // ---- page transitions: curtain sweeps up before leaving ----
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a')
    if (!a || reduced) return
    const url = new URL(a.href, location.href)
    const internal = url.origin === location.origin && !a.target && !a.hasAttribute('download')
    const samePageHash = url.pathname === location.pathname && url.hash
    if (!internal || samePageHash || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const curtain = document.querySelector('[data-curtain]')
    sessionStorage.setItem('aww-transition', '1')
    curtain.classList.remove('is-leaving')
    curtain.classList.add('is-covering')
    setTimeout(() => (location.href = url.href), 700)
  })
  // Restore state when coming back via the back button (bfcache).
  addEventListener('pageshow', (e) => {
    if (e.persisted) {
      const curtain = document.querySelector('[data-curtain]')
      curtain && curtain.classList.remove('is-covering')
    }
  })

  // ---- smooth anchor scroll ----
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'))
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    })
  )

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

  // ---- hero parallax: the orb drifts with the pointer ----
  const orb = document.querySelector('.hero__orb')
  if (orb && !reduced) {
    addEventListener('pointermove', (e) => {
      const x = (e.clientX / innerWidth - 0.5) * 40
      const y = (e.clientY / innerHeight - 0.5) * 40
      orb.style.translate = x + 'px ' + y + 'px'
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
