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
