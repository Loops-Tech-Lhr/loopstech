/* Progressive enhancement only: every page is complete HTML without this script. */
;(function () {
  'use strict'

  // Mobile menu ---------------------------------------------------------
  var menu = document.getElementById('mobile-menu')
  var openBtn = document.getElementById('mobile-menu-btn')
  var closeBtn = document.getElementById('close-menu')

  function setMenu(open) {
    if (!menu || !openBtn) return
    menu.classList.toggle('is-open', open)
    openBtn.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
    if (open && closeBtn) closeBtn.focus()
    if (!open) openBtn.focus()
  }

  if (menu && openBtn) {
    openBtn.addEventListener('click', function () {
      setMenu(true)
    })
    if (closeBtn)
      closeBtn.addEventListener('click', function () {
        setMenu(false)
      })
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false)
    })
    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) return
      if (e.key === 'Escape') setMenu(false)
      if (e.key === 'Tab') {
        var f = menu.querySelectorAll('a, button')
        var first = f[0]
        var last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    })
  }

  // Reveal on scroll ----------------------------------------------------
  var items = document.querySelectorAll('.reveal-on-scroll')
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    items.forEach(function (el) {
      io.observe(el)
    })
  } else {
    items.forEach(function (el) {
      el.classList.add('is-visible')
    })
  }

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Scroll progress bar + header shadow ----------------------------------
  var bar = document.createElement('div')
  bar.className = 'scroll-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)
  var header = document.querySelector('.site-header')
  var ticking = false
  function onScroll() {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight
      bar.style.setProperty(
        '--p',
        max > 0 ? (window.scrollY / max).toFixed(4) : 0
      )
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8)
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // Count-up numbers: <span data-count>250+</span> ------------------------
  var counters = document.querySelectorAll('[data-count]')
  function runCounter(el) {
    var text = el.textContent
    var m = text.match(/\d+/)
    if (!m || reduceMotion) return
    var end = parseInt(m[0], 10)
    var pre = text.slice(0, m.index)
    var post = text.slice(m.index + m[0].length)
    var start = null
    var dur = 1400
    function frame(ts) {
      if (start === null) start = ts
      var p = Math.min((ts - start) / dur, 1)
      var eased = 1 - Math.pow(1 - p, 3)
      el.textContent = pre + Math.round(end * eased) + post
      if (p < 1) window.requestAnimationFrame(frame)
    }
    window.requestAnimationFrame(frame)
    // if frames are paused (background tab), still end on the real number
    window.setTimeout(function () {
      el.textContent = text
    }, dur + 400)
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            runCounter(en.target)
            co.unobserve(en.target)
          }
        })
      },
      { threshold: 0.6 }
    )
    counters.forEach(function (el) {
      co.observe(el)
    })
  }

  // Cursor spotlight on cards (sets --mx / --my, CSS does the rest) ---------
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener(
      'pointermove',
      function (e) {
        var card =
          e.target.closest && e.target.closest('.cell, .bento-card, .role-card')
        if (!card) return
        var r = card.getBoundingClientRect()
        card.style.setProperty('--mx', e.clientX - r.left + 'px')
        card.style.setProperty('--my', e.clientY - r.top + 'px')
      },
      { passive: true }
    )
  }

  // Result of the no-JavaScript form fallback (?sent=1 / ?error=1) -----------
  var q = window.location.search
  var fallbackForm = document.getElementById('contact-form')
  if (fallbackForm && /[?&](sent|error)=1/.test(q)) {
    var st = fallbackForm.querySelector('.form-status')
    var ok = /[?&]sent=1/.test(q)
    st.textContent = ok
      ? fallbackForm.dataset.success
      : fallbackForm.dataset.error
    st.className = 'form-status ' + (ok ? 'is-ok' : 'is-error')
  }

  // Contact / lead form -------------------------------------------------
  var form = document.getElementById('contact-form')
  if (form) {
    var status = form.querySelector('.form-status')
    var setStatus = function (msg, cls) {
      status.textContent = msg
      status.className = 'form-status ' + (cls || '')
    }

    form.addEventListener('submit', function (e) {
      var fields = form.querySelectorAll('[required]')
      var firstBad = null
      fields.forEach(function (el) {
        var bad =
          !el.value.trim() ||
          (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value))
        el.setAttribute('aria-invalid', String(bad))
        if (bad && !firstBad) firstBad = el
      })
      if (firstBad) {
        e.preventDefault()
        firstBad.focus()
        return
      }
      if (!window.fetch) return // falls back to a normal POST

      e.preventDefault()
      var btn = form.querySelector('button[type="submit"]')
      var label = btn.textContent
      btn.disabled = true
      btn.textContent = form.dataset.sending
      setStatus('')

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status')
          return res.json()
        })
        .then(function () {
          form.reset()
          setStatus(form.dataset.success, 'is-ok')
        })
        .catch(function () {
          setStatus(form.dataset.error, 'is-error')
        })
        .then(function () {
          btn.disabled = false
          btn.textContent = label
        })
    })
  }
})()
