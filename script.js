// Marina Lodvikova — interactions
// (Принудительный скролл-в-верх вынесен в inline-скрипт в <head> index.html,
// чтобы сработать ДО парсинга body и восстановления скролла браузером.)

// Клики по внутренним якорям: скроллим к секции, но не оставляем #event-X в URL,
// иначе при следующем открытии браузер откроет сайт там же, а не сверху.
document.addEventListener('click', function (e) {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Чистим хэш из URL без перезагрузки и без сохранения в истории.
  if (history.replaceState) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
});

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
