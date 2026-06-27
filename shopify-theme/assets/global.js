// Regincós theme — lightweight interactions
document.addEventListener('click', function (e) {
  // product gallery thumbnail swap
  var thumb = e.target.closest('.thumbs img');
  if (thumb) {
    document.querySelectorAll('.thumbs img').forEach(function (x) { x.classList.remove('on'); });
    thumb.classList.add('on');
    var main = document.getElementById('mainimg');
    if (main) main.src = thumb.getAttribute('data-full') || thumb.src;
  }
  // variant option buttons
  var optBtn = e.target.closest('.opt .row button');
  if (optBtn) {
    optBtn.parentElement.querySelectorAll('button').forEach(function (b) { b.classList.remove('on'); });
    optBtn.classList.add('on');
    if (window.RGsyncVariant) window.RGsyncVariant();
  }
  // quantity
  if (e.target.id === 'plus' || e.target.id === 'minus') {
    var q = document.getElementById('q');
    var qi = document.getElementById('quantity');
    if (q) {
      var v = parseInt(q.textContent, 10) || 1;
      v = e.target.id === 'plus' ? v + 1 : Math.max(1, v - 1);
      q.textContent = v;
      if (qi) qi.value = v;
    }
  }
});
// collection filter + sort
(function () {
  var grid = document.getElementById('grid');
  if (!grid) return;
  document.querySelectorAll('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); });
      c.classList.add('on');
      var f = c.getAttribute('data-filter');
      grid.querySelectorAll('.prod').forEach(function (card) {
        var cat = card.getAttribute('data-cat') || '';
        card.style.display = (f === 'all' || cat.indexOf(f) > -1) ? '' : 'none';
      });
    });
  });
  var sort = document.getElementById('sort');
  if (sort) sort.addEventListener('change', function () {
    var v = sort.value, cards = [].slice.call(grid.querySelectorAll('.prod'));
    cards.sort(function (a, b) {
      var pa = parseFloat(a.getAttribute('data-price')) || 0, pb = parseFloat(b.getAttribute('data-price')) || 0;
      return v === 'low' ? pa - pb : v === 'high' ? pb - pa : 0;
    });
    cards.forEach(function (c) { grid.appendChild(c); });
  });
})();
// theme toggle (dark mode) — pairs with base.css [data-theme="dark"] + flash-guard w theme.liquid
(function () {
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('rg_theme', t); } catch (e) {}
    document.querySelectorAll('.themetoggle').forEach(function (b) { b.textContent = t === 'dark' ? '☀' : '☾'; b.setAttribute('aria-pressed', t === 'dark'); });
  }
  var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(cur);
  document.querySelectorAll('.themetoggle').forEach(function (b) {
    b.addEventListener('click', function () { applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });
  });
})();
// hero video gate (poster-only pod reduced-motion / data-saver)
(function () {
  var hv = document.querySelector('.hero video.bg'); if (!hv) return;
  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var sd = navigator.connection && navigator.connection.saveData;
  if (rm || sd) { hv.style.display = 'none'; var fb = document.querySelector('.hero .bg-fallback'); if (fb) fb.style.display = 'block'; }
  else { var p = hv.play(); if (p && p.catch) p.catch(function () {}); }
})();

/* RG-PORT-APPLIED */

/* === find-your-brush quiz === */
// ===== Find-your-brush quiz (ported from prototype initQuiz; OS 2.0 section-aware) =====
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Pick the first rule whose set fields all match the answers ('any'/blank = wildcard).
  function matchRule(rules, a) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      var ok = ['hair', 'material', 'use'].every(function (k) {
        var want = r[k];
        return !want || want === 'any' || want === a[k];
      });
      if (ok) return r;
    }
    return null;
  }

  function initQuiz(root) {
    if (!root || root.__quizInit) return;
    var cfgEl = root.querySelector('[data-quiz-config]');
    var stage = root.querySelector('[data-qz-stage]');
    var bar = root.querySelector('[data-qz-bar]');
    var emailTpl = root.querySelector('[data-qz-email-tpl]');
    if (!cfgEl || !stage) return;

    var cfg;
    try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
    var steps = cfg.steps || [];
    var i18n = cfg.i18n || {};
    if (!steps.length) return;
    root.__quizInit = true;

    var answers = {};
    var step = 0;
    var inResult = false;

    function renderStep() {
      inResult = false;
      var s = steps[step];
      if (bar) bar.style.width = Math.round(step / steps.length * 100) + '%';
      var opts = (s.opts || []).map(function (o) {
        return '<button class="qz-opt" type="button" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
      }).join('');
      stage.innerHTML =
        '<div class="qz-q">' + esc(s.q) + '</div>' +
        '<div class="qz-opts">' + opts + '</div>' +
        (step > 0 ? '<button class="qz-back" type="button" data-back="1">' + esc(i18n.back) + '</button>' : '');

      stage.querySelectorAll('.qz-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          answers[s.key] = b.getAttribute('data-v');
          step++;
          if (step < steps.length) renderStep(); else renderResult();
        });
      });
      var back = stage.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { step--; renderStep(); });
    }

    function renderResult(emailDone) {
      inResult = true;
      if (bar) bar.style.width = '100%';
      var rule = matchRule(cfg.rules || [], answers);
      var data = rule || cfg.fallback;

      if (!data || !data.product) {
        stage.innerHTML = '<div class="qz-q">' + esc(i18n.noprod) + '</div>' +
          '<button class="qz-back" type="button" data-restart="1">' + esc(i18n.back) + '</button>';
        var rb = stage.querySelector('[data-restart]');
        if (rb) rb.addEventListener('click', restart);
        return;
      }

      var p = data.product;
      var imgHtml = p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : '';
      stage.innerHTML =
        '<div class="qz-result">' + imgHtml + '<div>' +
          '<div class="upper qz-r-eye">' + esc(i18n.eye) + '</div>' +
          '<div class="qz-r-name serif">' + esc(p.title) + '</div>' +
          (data.reason ? '<div class="qz-r-reason">' + esc(data.reason) + '</div>' : '') +
          '<div class="qz-r-price">' + esc(p.price) + '</div>' +
          '<a class="btn" href="' + esc(p.url) + '">' + esc(i18n.cta) + '</a>' +
        '</div></div>';

      // Append the real Shopify email-capture form (cloned from the hidden template).
      if (emailTpl) {
        var holder = document.createElement('div');
        holder.innerHTML = emailTpl.innerHTML;
        stage.appendChild(holder.firstElementChild || holder);
        var restartBtn = stage.querySelector('[data-qz-restart]');
        if (restartBtn) restartBtn.addEventListener('click', restart);
      }
    }

    function restart() {
      step = 0;
      Object.keys(answers).forEach(function (k) { delete answers[k]; });
      renderStep();
    }

    // Re-render on language switch (mirrors prototype window.quizRerender) — config is re-parsed by
    // re-fetching textContent, but i18n strings here come from Liquid {{ | t }} so a section reload
    // (shopify:section:load) is the source of truth; keep a soft rerender for client-only toggles.
    root.__quizRerender = function () { if (inResult) renderResult(); else renderStep(); };

    // If the customer form posted successfully, Shopify re-rendered the section with .qz-done
    // inside the email template. Jump straight to the result screen so the success state shows.
    var posted = emailTpl && emailTpl.querySelector('[data-qz-posted]');
    if (posted) renderResult(true); else renderStep();
  }

  function initAll(ctx) {
    var scope = ctx && ctx.querySelectorAll ? ctx : document;
    scope.querySelectorAll('[data-quiz-section]').forEach(initQuiz);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }

  // Theme editor: re-init when a section is (re)loaded.
  document.addEventListener('shopify:section:load', function (e) {
    var el = e.target.querySelector ? e.target.querySelector('[data-quiz-section]') : null;
    if (el) { el.__quizInit = false; initQuiz(el); }
  });
})();

/* === complete-the-ritual bundle / frequently-bought-together (sec === */
// "Complete the ritual" bundle — add-all-to-cart via /cart/add.js (frequently-bought-together)
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-bundle-add]');
  if (!btn || btn.getAttribute('aria-busy') === 'true') return;
  var section = btn.closest('.bundle');
  if (!section) return;
  var S = window.RGbundleStrings || {};
  var items = [].slice.call(section.querySelectorAll('.bn-item[data-variant-id]'))
    .map(function (el) {
      var id = parseInt(el.getAttribute('data-variant-id'), 10);
      return id ? { id: id, quantity: 1 } : null;
    })
    .filter(Boolean);
  if (!items.length) return;

  var original = btn.textContent;
  btn.setAttribute('aria-busy', 'true');
  if (S.adding) btn.textContent = S.adding;

  fetch((window.Shopify && window.Shopify.routes && window.Shopify.routes.root || '/') + 'cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ items: items })
  })
    .then(function (r) {
      if (!r.ok) throw new Error('cart-add');
      return r.json();
    })
    .then(function () {
      var redirect = btn.getAttribute('data-cart-redirect') === 'true';
      if (redirect) {
        window.location.href = window.RGcartUrl || ((window.Shopify && window.Shopify.routes && window.Shopify.routes.root || '/') + 'cart');
        return;
      }
      // no redirect: confirm in-place + bump the header cart count
      btn.classList.add('added');
      btn.textContent = S.added || '✓';
      var cartLink = document.querySelector('.navicons a[href*="cart"]');
      if (cartLink) {
        var n = (cartLink.textContent.match(/\d+/) || ['0'])[0];
        cartLink.textContent = '⛒ ' + (parseInt(n, 10) + items.length);
      }
      btn.setAttribute('aria-busy', 'false');
    })
    .catch(function () {
      btn.setAttribute('aria-busy', 'false');
      btn.textContent = original;
      if (S.error) window.alert(S.error);
    });
});

/* === Dynamic PDP enrichments — thumbnail click-to-swap (with fade === */
// === PDP enrichments: fade thumb-swap, 360 orbit toggle, sticky add-to-cart bar ===
// Re-runnable so it works after section-render in the Theme Editor (called from main-product.liquid).
window.RGinitPDP = function () {
  var gallery = document.querySelector('[data-pdp-gallery]');
  if (!gallery || gallery.dataset.pdpInit === '1') return;
  gallery.dataset.pdpInit = '1';

  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // (1) thumbnail click-to-swap main image, with fade (prototype .swapping behaviour).
  // The delegated handler in global.js already sets .on + src instantly; here we add the fade.
  gallery.querySelectorAll('.thumbs img').forEach(function (t) {
    t.addEventListener('click', function () {
      var main = document.getElementById('mainimg');
      var full = t.getAttribute('data-full');
      if (!main || !full) return;
      if (reduce) { main.src = full; return; }
      main.classList.add('swapping');
      setTimeout(function () { main.src = full; main.classList.remove('swapping'); }, 180);
    });
  });

  // (2) 360 orbit viewer toggle (only present when product has the orbit_video metafield).
  var btn = document.getElementById('v360btn');
  var mainBox = gallery.querySelector('.main');
  var vid = document.getElementById('v360');
  if (btn && mainBox && vid) {
    btn.addEventListener('click', function () {
      var on = mainBox.classList.toggle('is360');
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) { vid.load(); var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      else { vid.pause(); }
    });
  }

  // (3) sticky add-to-cart bar — shows when the buy row scrolls out of view.
  var bar = document.getElementById('pdp-stickybar');
  var buy = document.querySelector('[data-buyrow]');
  if (bar && buy && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      bar.classList.toggle('show', !e.isIntersecting);
      bar.setAttribute('aria-hidden', e.isIntersecting ? 'true' : 'false');
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(buy);
  }
};
// Run on initial load (the inline script also calls it once RGvariants is set).
if (document.readyState !== 'loading') { window.RGinitPDP && window.RGinitPDP(); }
else { document.addEventListener('DOMContentLoaded', function () { window.RGinitPDP && window.RGinitPDP(); }); }
