# Clamp CSS Generator

Калькулятор CSS `clamp()` функции, созданный на Nuxt.js со статической генерацией (SSG).

## Описание проекта

Интерактивный калькулятор для создания CSS `clamp()` функций, который помогает разработчикам создавать адаптивные дизайны с плавным масштабированием значений в зависимости от размера viewport.

### Ключевые возможности

- 🎯 Точные расчеты CSS clamp() с использованием математических формул
- 📱 Поддержка адаптивного дизайна для всех размеров экранов
- 🔧 Выбор единиц измерения: rem или пиксели
- 📋 Копирование результата в буфер обмена одним кликом
- 📚 Встроенная справка с примерами и формулами расчета
- 🔗 Полезные ресурсы и ссылки на документацию

## Технические особенности

- Nuxt.js 3 + TypeScript
- Vue 3 Composition API
- Статическая генерация (SSG)
- Автоматическое развертывание в Symfony Twig шаблон
- Адаптивный дизайн с поддержкой мобильных устройств

## Развертывание

Проект настроен для автоматического развертывания в Symfony Twig шаблон.

### Команды

```bash
# Разработка
npm run dev

# Статическая сборка
npm run build:ssg

# Развертывание в Twig шаблон
npm run deploy:twig
```

### Что делает команда deploy:twig

1. Выполняет статическую сборку (`nuxt generate`)
2. Анализирует сгенерированный `index.html`
3. Извлекает пути к CSS и JS файлам
4. Обновляет Twig шаблон `templates/landing/converter.html.twig`
5. Копирует все статические ресурсы в `public/clamp/`

### Структура после развертывания

```
public/clamp/
├── assets/          # CSS и JS файлы
├── _nuxt/          # Nuxt ресурсы
└── ...             # Другие статические файлы

templates/landing/converter.html.twig  # Обновленный Twig шаблон
```

### Настройки

Конфигурация находится в `nuxt.config.ts`:

- `baseURL: '/clamp/'` - базовый URL для роутинга
- `prerender.routes: ['/']` - статическая генерация главной страницы
- `crawlLinks: true` - автоматическое обнаружение дополнительных страниц

## Разработка

Приложение использует:

- **Nuxt.js 3** для SSG
- **Vue 3 Composition API**
- **Pinia** для состояния
- **TypeScript** поддержка

Основной компонент: `components/ClampConverter.vue`

## Как работает калькулятор

Калькулятор использует математические формулы для создания плавного масштабирования:

1. **Change (скорость изменения):** `(sizeMax - sizeMin) / (viewportMax - viewportMin)`
2. **Intercept (базовое значение):** `sizeMin - viewportMin × Change`
3. **Viewport Coefficient:** `100vw × Change`
4. **Результат:** `clamp(sizeMin, Intercept + ViewportCoefficient, sizeMax)`

### Пример использования

Входные данные:
- VALUES: MIN 15px, MAX 25px
- VIEWPORT: MIN 1000px, MAX 1920px

Результат: `clamp(0.938rem, 0.258rem + 1.087vw, 1.563rem)`

## Интеграция

Этот проект является подпроектом основного Symfony приложения webkyrs и автоматически исключен из его Git репозитория.

### Доступ к приложению
- Разработка: `http://localhost:3000/`
- Продакшн: `https://your-domain.com/clamp/`

## Полезные ресурсы

- [MDN: clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) — официальная документация
- [Utopia](https://utopia.fyi/) — калькулятор для fluid типографики
- [Chris Burnell's Calculator](https://chrisburnell.com/clamp-calculator/) — оригинальный вдохновитель
- [CSS-Tricks Guide](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/) — подробное руководство

## Лицензия

Проект разработан как часть образовательной платформы webkyrs.