<p align="center">

<img src="https://img.shields.io/badge/FunMint-Automation-blueviolet?style=for-the-badge">

</p>


<h1 align="center">

⚡ FunMint

</h1>

<p align="center">
Инструменты автоматизации для продавцов <b>FunPay</b>
- автоответы, перебив цен, автоподнятие лотов и статистика.
</p>
<p align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js">
    <img src="https://img.shields.io/badge/Express-backend-black?logo=express">
    <img src="https://img.shields.io/badge/MySQL-database-blue?logo=mysql">
    <img src="https://img.shields.io/badge/Redis-cache-red?logo=redis">
    <img src="https://img.shields.io/badge/license-MIT-green">
    <img src="https://img.shields.io/badge/status-active-success">
</p>

------------------------------------------------------------------------

# ⚡ О проекте

**FunMint** - это сервис автоматизации для продавцов и пользователей
**FunPay**.

Проект создан для того, чтобы убрать рутинные действия при работе с
маркетплейсом и автоматизировать основные процессы продаж.

Система автоматически отвечает клиентам, следит за отзывами, поднимает
лоты, анализирует цены конкурентов и собирает статистику.

Главная цель проекта - **экономить время продавцов и увеличивать
эффективность работы на FunPay**.

------------------------------------------------------------------------

# ✨ Возможности

### 🤖 Умные автоответы

Автоматические ответы на ключевые слова, приветствия и уведомления о
покупке.\
Клиенты получают быстрый отклик даже когда вы офлайн.

### ⭐ Автоответ на отзывы

Сервис автоматически благодарит клиентов за оставленные отзывы и
поддерживает активность профиля.

### 📈 Автоподнятие лотов

Ваши товары всегда находятся выше в списке - система автоматически
поднимает лоты.

### 💰 Динамическое ценообразование

Функция анализирует цены конкурентов и снижает стоимость ваших товаров,
чтобы они оставались более выгодными.

### 📊 Статистика

Следите за статистикой продаж, доходами и активностью аккаунта.

### 🟢 Вечный онлайн

Система поддерживает активность аккаунта и позволяет клиентам получать
ответы даже когда вы не на сайте.

------------------------------------------------------------------------

# 🧰 Используемые технологии

## Backend

-   Node.js
-   Express

## Базы данных

-   MySQL
-   Redis

## Основные библиотеки

-   express
-   mysql2
-   redis
-   connect-redis
-   bcrypt
-   nodemailer
-   multer
-   cheerio
-   undici
-   p-queue
-   express-rate-limit
-   helmet
-   csurf

------------------------------------------------------------------------

# 🏗 Архитектура

    Пользователь
     │
     ▼
    Nginx (reverse proxy)
     │
     ▼
    Express сервер (Node.js)
     │
     ├── Авторизация и сессии
     ├── Модули автоматизации
     │    ├── Автоответы
     │    ├── Ответы на отзывы
     │    ├── Поднятие лотов
     │    ├── Динамические цены
     │    └── Статистика
     │
     ├── Очереди задач (P-Queue)
     │
     ├── MySQL — основная база данных
     │
     └── Redis — сессии и кеш

------------------------------------------------------------------------

# 📂 Структура проекта

    funmint
    │   .env
    │   package.json
    │   README.md
    │   
    ├───nginx
    │   └───conf
    │           nginx.conf
    │
    └───src
        │   server.js
        │
        ├───core
        │       answer.js
        │       raise.js
        │       reduction.js
        │       review.js
        │       stats.js
        │
        ├───resources
        │   │   robots.txt
        │   │   sitemap.xml
        │   │
        │   ├───fonts
        │   │   └───Inter
        │   │           Inter-Black.woff2
        │   │           Inter-BlackItalic.woff2
        │   │           Inter-Bold.woff2
        │   │           Inter-BoldItalic.woff2
        │   │           Inter-ExtraBold.woff2
        │   │           Inter-ExtraBoldItalic.woff2
        │   │           Inter-ExtraLight.woff2
        │   │           Inter-ExtraLightItalic.woff2
        │   │           Inter-Italic.woff2
        │   │           Inter-Light.woff2
        │   │           Inter-LightItalic.woff2
        │   │           Inter-Medium.woff2
        │   │           Inter-MediumItalic.woff2
        │   │           Inter-Regular.woff2
        │   │           Inter-SemiBold.woff2
        │   │           Inter-SemiBoldItalic.woff2
        │   │           Inter-Thin.woff2
        │   │           Inter-ThinItalic.woff2
        │   │           InterDisplay-Black.woff2
        │   │           InterDisplay-BlackItalic.woff2
        │   │           InterDisplay-Bold.woff2
        │   │           InterDisplay-BoldItalic.woff2
        │   │           InterDisplay-ExtraBold.woff2
        │   │           InterDisplay-ExtraBoldItalic.woff2
        │   │           InterDisplay-ExtraLight.woff2
        │   │           InterDisplay-ExtraLightItalic.woff2
        │   │           InterDisplay-Italic.woff2
        │   │           InterDisplay-Light.woff2
        │   │           InterDisplay-LightItalic.woff2
        │   │           InterDisplay-Medium.woff2
        │   │           InterDisplay-MediumItalic.woff2
        │   │           InterDisplay-Regular.woff2
        │   │           InterDisplay-SemiBold.woff2
        │   │           InterDisplay-SemiBoldItalic.woff2
        │   │           InterDisplay-Thin.woff2
        │   │           InterDisplay-ThinItalic.woff2
        │   │           InterVariable-Italic.woff2
        │   │           InterVariable.woff2
        │   │
        │   └───images
        │           crystalpay.png
        │           favicon.ico
        │           icon.png
        │           sbp.png
        │
        ├───routes
        │   │   auth.js
        │   │   profile.js
        │   │   settings.js
        │   │   shop.js
        │   │   webhook.js
        │   │
        │   ├───auth
        │   │   │   login.js
        │   │   │   logout.js
        │   │   │   register.js
        │   │   │
        │   │   └───utils
        │   │           random.js
        │   │
        │   ├───settings
        │   │       answer.js
        │   │       goldenKey.js
        │   │       reduction.js
        │   │       review.js
        │   │       toggle.js
        │   │
        │   └───webhook
        │       │   crystalpay.js
        │       │   platega.js
        │       │
        │       └───utils
        │               sig.js
        │
        ├───runner
        │       runner.js
        │
        ├───services
        │       proxy.js
        │
        ├───static
        │   ├───scripts
        │   │       fselect.js
        │   │       index.js
        │   │       login.js
        │   │       profile.js
        │   │       shop.js
        │   │
        │   └───styles
        │           Inter.css
        │           style.css
        │
        ├───utils
        │       email.js
        │       hash.js
        │       requests.js
        │       storage.js
        │
        └───views
                cookie.html
                data-policy.html
                index.hbs
                letter.hbs
                login.hbs
                oops.html
                privacy.html
                profile.hbs
                terms.html
                thank-you.html

------------------------------------------------------------------------

# ⚙ Установка

### 1. Клонировать репозиторий

``` bash
git clone https://github.com/Sad0wW/funmint.git
cd funmint
```

### 2. Установить зависимости

``` bash
npm install
```

### 3. Создать `.env`

    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_NAME=database
    DB_PASSWORD=password

    REDIS_URL=redis://127.0.0.1:6379

    EMAIL_NOREPLY=noreply@funmint.ru
    EMAIL_HOST="smtp.zoho.eu"
    EMAIL_PORT=465
    EMAIL_USER=root@funmint.ru
    EMAIL_PASSWORD=password

    CRYSTALPAY_LOGIN=funmint
    CRYSTALPAY_AUTH_SECRET=secret
    CRYSTALPAY_AUTH_SALT=salt
    CRYSTALPAY_REDIRECT_URL=https://funmint.ru/thank-you
    CRYSTALPAY_CALLBACK_URL=https://funmint.ru/webhook/crystalpay

    PLATEGA_API_KEY=key
    PLATEGA_MERCHANT_ID=id
    PLATEGA_RETURN_URL=https://funmint.ru/thank-you
    PLATEGA_FAIL_URL=https://funmint.ru/oops

    PROXY_API_KEY=key

    GOLDENKEY_SECRET=u1kqZZCH1Fnpw+scB3Wi7gz6e5maMt1KxV64iOY6mOQ=
    SESSION_SECRET=c279fe9abb74615003a78643d1c1bb3a929061f7f39158a8d581b1d3e217e67711bdc921d5092824276ad81f7dd92cc36e91800ec174c836d01fd5136e6b5c25

    SALT_ROUNDS=12

    PORT=3000
    TRUST_PROXY=2
    DELAY=1000

### 4. Запустить сервер

    npm start

После запуска приложение будет доступно по адресу:

    http://localhost:3000

------------------------------------------------------------------------

# 🔒 Безопасность

В проекте используются несколько уровней защиты:

-   Helmet - защита HTTP заголовков
-   CSRF защита
-   Rate limiting (защита от брутфорса)
-   bcrypt - безопасное хранение паролей
-   Redis - безопасное хранение сессий

------------------------------------------------------------------------

# 📜 Скрипты

    npm start
    npm run dev

------------------------------------------------------------------------

# ⭐ Поддержка проекта

Если проект оказался полезным - поставьте ⭐ на GitHub.

------------------------------------------------------------------------

# 📄 Лицензия

MIT License
