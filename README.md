# Marina Lodvikova — календарь июня 2026

Статический сайт-витрина мероприятий. Без сборки, без бэкенда — три файла:

```
index.html
styles.css
script.js
```

## Локальный просмотр

```sh
cd /Users/andreylodvikov/marina-site
python3 -m http.server 8770
# открыть http://localhost:8770
```

## Деплой на Vercel (самый простой путь — без CLI)

1. Зайдите на https://vercel.com → войти через Google/GitHub
2. **Add New… → Project → Deploy from local folder** (или иконка «Upload»)
3. Перетащите папку `/Users/andreylodvikov/marina-site`
4. Project Name: `marina` → **Deploy**

Через ~10 секунд получите ссылку вида `https://marina.vercel.app`.

## Если есть свой домен

В настройках проекта Vercel → **Domains** → добавьте свой домен и пропишите DNS у регистратора (Vercel подскажет, какие записи нужны).

## Замена контента

- **Тексты событий** — в `index.html`, ищите блоки `<!-- 1. ЖЕНСКИЕ АРХЕТИПЫ -->`, `<!-- 2. ТЕЛЕСНАЯ ПРАКТИКА -->` и т.д.
- **Telegram ссылка** — глобально в файле: поиск `t.me/Diamondmari`
- **Фото вместо стилизованных карточек** — в `.event-visual` добавьте `<img>` и в `styles.css` восстановите правила `.event-visual img`
- **Цвета и шрифты** — переменные в самом верху `styles.css` (`:root { --gold: …; --serif: …; }`)
