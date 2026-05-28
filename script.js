// Marina Lodvikova — interactions

// При прямом заходе — всегда наверх (отключаем восстановление прошлой позиции скролла).
// Если в URL есть #event-X — оставляем браузеру родной переход к якорю.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (!window.location.hash) {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

// Topbar transparency
const topbar = document.getElementById('topbar');
const onScroll = () => {
  if (window.scrollY > 60) topbar.classList.add('scrolled');
  else topbar.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll (uses IO; elements already in viewport flip immediately)
const reveals = document.querySelectorAll('.reveal');
const flip = (el) => el.classList.add('visible');
const inView = (el) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};
reveals.forEach(el => { if (inView(el)) flip(el); });

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      flip(e.target);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
reveals.forEach(el => { if (!el.classList.contains('visible')) io.observe(el); });

// Active dot on right rail
const railLinks = document.querySelectorAll('.rail a');
const eventSections = Array.from(document.querySelectorAll('[id^="event-"]'));
const railObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      railLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });
eventSections.forEach(s => railObserver.observe(s));
