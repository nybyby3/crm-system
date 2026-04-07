# CRM System

Полнофункциональная CRM-система на Next.js 14.

## Возможности

- **Дашборд** — аналитика с графиками (recharts)
- **Контакты** — CRUD, поиск, привязка к компаниям
- **Компании** — CRUD, поиск, связанные контакты
- **Сделки** — Kanban-доска с drag & drop, табличный вид
- **Задачи** — карточки с приоритетами и статусами, фильтры
- **Авторизация** — логин/регистрация

## Деплой на Vercel

### Вариант 1: Через GitHub

1. Создай репозиторий на GitHub
2. Загрузи проект:
   ```bash
   git init
   git add .
   git commit -m "Initial CRM commit"
   git remote add origin https://github.com/YOUR_USER/crm.git
   git push -u origin main
   ```
3. Зайди на [vercel.com](https://vercel.com), подключи GitHub
4. Импортируй репозиторий — Vercel автоматически задеплоит

### Вариант 2: Через Vercel CLI

```bash
npm i -g vercel
vercel
```

## Локальный запуск

```bash
npm install
npm run dev
```

Откроется на http://localhost:3000

## Вход по умолчанию

- Email: `admin@crm.com`
- Пароль: `admin123`

## Стек

- Next.js 14 (App Router, static export)
- TypeScript
- Tailwind CSS
- Recharts
- localStorage (данные хранятся в браузере)
