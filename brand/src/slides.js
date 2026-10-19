// Adds waves + footer (mark, site, counter) to every .slide.
// ?s=N shows only slide N (for export); ?all shows them stacked (for review).
(function () {
  var slides = document.querySelectorAll('.slide');
  var waves = '<svg class="waves" viewBox="0 0 1080 150" preserveAspectRatio="none" aria-hidden="true">' +
    '<path class="w1" d="M0 70c90-30 180-30 270 0s180 30 270 0 180-30 270 0 180 30 270 0v80H0z"/>' +
    '<path class="w2" d="M0 105c90-24 180-24 270 0s180 24 270 0 180-24 270 0 180 24 270 0v45H0z"/></svg>';
  slides.forEach(function (el, i) {
    el.insertAdjacentHTML('beforeend', waves +
      '<div class="foot"><img src="../logo/arabtides-mark.svg" alt=""><span class="site">arabtides.com</span>' +
      (slides.length > 1 ? '<span class="count">' + (i + 1) + '/' + slides.length + '</span>' : '') + '</div>');
  });
  var q = new URLSearchParams(location.search);
  if (q.has('all')) { document.body.classList.add('all'); return; }
  var n = Math.max(1, Math.min(slides.length, parseInt(q.get('s') || '1', 10)));
  slides[n - 1].classList.add('on');
})();
