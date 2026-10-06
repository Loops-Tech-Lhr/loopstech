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
