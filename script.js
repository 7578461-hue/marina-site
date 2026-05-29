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

// Кнопка «+ в календарь» — генерирует .ics на лету и инициирует скачивание.
// На iPhone/Mac откроется системный Календарь, на Android — Google Calendar,
// на Windows — Outlook. Один файл, без выбора провайдеров.
(function () {
  const escapeIcs = (s) => String(s == null ? '' : s)
    .replace(/\\/g, '\\\\').replace(/;/g, '\\;')
    .replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  const fold = (line) => {
    // RFC 5545: строки не длиннее 75 октетов; продолжение начинается с пробела.
    if (line.length <= 75) return line;
    const chunks = [];
    let i = 0;
    while (i < line.length) {
      chunks.push(line.slice(i, i + 73));
      i += 73;
    }
    return chunks.join('\r\n ');
  };

  const buildIcs = (opts) => {
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const uid = (Date.now() + '-' + Math.random().toString(36).slice(2, 8)) + '@marina-lodvikova.vercel.app';
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Marina Lodvikova//Calendar//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + now,
    ];
    if (opts.allday) {
      // Дата без времени: DTSTART;VALUE=DATE:20260627
      lines.push('DTSTART;VALUE=DATE:' + opts.allday);
      // DTEND для all-day = следующий день (эксклюзивный)
      const y = opts.allday.slice(0, 4);
      const m = opts.allday.slice(4, 6);
      const d = opts.allday.slice(6, 8);
      const next = new Date(Date.UTC(+y, +m - 1, +d + 1));
      const ne = next.toISOString().slice(0, 10).replace(/-/g, '');
      lines.push('DTEND;VALUE=DATE:' + ne);
    } else {
      lines.push('DTSTART:' + opts.start);
      lines.push('DTEND:' + opts.end);
    }
    lines.push(fold('SUMMARY:' + escapeIcs(opts.title)));
    if (opts.location) lines.push(fold('LOCATION:' + escapeIcs(opts.location)));
    if (opts.description) lines.push(fold('DESCRIPTION:' + escapeIcs(opts.description)));
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-cal');
    if (!btn) return;
    e.preventDefault();
    const ics = buildIcs({
      title: btn.dataset.title,
      start: btn.dataset.start,
      end: btn.dataset.end,
      allday: btn.dataset.allday,
      location: btn.dataset.location,
      description: btn.dataset.desc,
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (btn.dataset.title || 'event').replace(/[^а-яА-Яa-zA-Z0-9-]+/g, '-').slice(0, 60);
    a.download = safeName + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    // Визуальный фидбэк
    const old = btn.textContent;
    btn.textContent = '✓ файл скачан';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = old;
      btn.classList.remove('copied');
    }, 2200);
  });
})();

// Кнопки-CTA в Telegram: при клике формируется t.me/Diamondmari?text=<encoded>
document.addEventListener('click', function (e) {
  const a = e.target.closest('a.tg-cta');
  if (!a) return;
  const tpl = a.getAttribute('data-tg');
  if (!tpl) return;
  e.preventDefault();
  const url = 'https://t.me/Diamondmari?text=' + encodeURIComponent(tpl);
  window.open(url, '_blank', 'noopener');
});

// Кнопка «скопировать адрес»
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const text = btn.getAttribute('data-copy') || '';
  if (!text) return;
  const done = () => {
    const old = btn.textContent;
    btn.textContent = 'скопировано';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = old;
      btn.classList.remove('copied');
    }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => {
      window.prompt('Скопируйте адрес:', text);
    });
  } else {
    window.prompt('Скопируйте адрес:', text);
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
