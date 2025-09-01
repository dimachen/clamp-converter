import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const distPath = path.join(projectRoot, '.output', 'public')
const twigTemplatePath = path.resolve(projectRoot, '../../templates/landing/converter.html.twig')

console.log('🚀 Начинаю развертывание SSG сборки в Twig шаблон...')
console.log(`📁 Путь к сборке: ${distPath}`)
console.log(`📁 Путь к Twig шаблону: ${twigTemplatePath}`)

// Проверяем, существует ли директория сборки
if (!fs.existsSync(distPath)) {
  console.error('❌ Директория сборки не найдена! Убедитесь, что выполнили npm run build:ssg')
  process.exit(1)
}

// Читаем index.html или 200.html из сборки
let indexPath = path.join(distPath, 'index.html')
let indexContent

if (fs.existsSync(indexPath)) {
  indexContent = fs.readFileSync(indexPath, 'utf-8')
  console.log('📄 Прочитан файл index.html')
} else {
  // Пробуем 200.html (файл для SPA режима)
  indexPath = path.join(distPath, '200.html')
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Ни index.html, ни 200.html не найдены в сборке!')
    process.exit(1)
  }
  indexContent = fs.readFileSync(indexPath, 'utf-8')
  console.log('📄 Прочитан файл 200.html')
}

// Извлекаем CSS файлы
const cssMatches = indexContent.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)
const cssFiles = []

if (cssMatches) {
  cssMatches.forEach(match => {
    const hrefMatch = match.match(/href="([^"]+)"/)
    if (hrefMatch) {
      let cssPath = hrefMatch[1]
      // Если путь уже содержит /clamp/, используем его как есть
      // Иначе добавляем /clamp/ префикс
      if (!cssPath.startsWith('/clamp/')) {
        cssPath = '/clamp/' + cssPath.replace(/^\//, '')
      }
      cssFiles.push(cssPath)
      console.log(`🎨 Найден CSS: ${cssPath}`)
    }
  })
}

// Извлекаем JS файлы
const jsMatches = indexContent.match(/<script[^>]+src="([^"]+\.js)"[^>]*>/g)
const jsFiles = []

if (jsMatches) {
  jsMatches.forEach(match => {
    const srcMatch = match.match(/src="([^"]+)"/)
    if (srcMatch) {
      let jsPath = srcMatch[1]
      // Если путь уже содержит /clamp/, используем его как есть
      // Иначе добавляем /clamp/ префикс
      if (!jsPath.startsWith('/clamp/')) {
        jsPath = '/clamp/' + jsPath.replace(/^\//, '')
      }
      jsFiles.push(jsPath)
      console.log(`📜 Найден JS: ${jsPath}`)
    }
  })
}

// Извлекаем также скрипт с конфигурацией Nuxt
const nuxtConfigMatch = indexContent.match(/<script>window\.__NUXT__[^<]*<\/script>/)
const nuxtConfigScript = nuxtConfigMatch ? nuxtConfigMatch[0] : ''

// Извлекаем data script
const nuxtDataMatch = indexContent.match(/<script[^>]*data-nuxt-data[^>]*>[^<]*<\/script>/)
const nuxtDataScript = nuxtDataMatch ? nuxtDataMatch[0] : ''

// Создаем новый Twig шаблон
const newTwigContent = `{% extends 'base.html.twig' %}

{% block title %}Clamp CSS Generator - Дмитрий Ченгаев{% endblock %}

{% block stylesheets %}
    {{ parent() }}
${cssFiles.map(css => `    <link rel="stylesheet" href="${css}">`).join('\n')}
{% endblock %}

{% block content %}
    <div id="__nuxt"></div>
    <div id="teleports"></div>
    ${nuxtDataScript}
    ${nuxtConfigScript}
{% endblock %}

{% block javascripts %}
    {{ parent() }}
${jsFiles.map(js => `    <script type="module" crossorigin src="${js}"></script>`).join('\n')}
{% endblock %}
`

// Записываем обновленный Twig шаблон
fs.writeFileSync(twigTemplatePath, newTwigContent)
console.log('✅ Twig шаблон обновлен успешно!')

// Копируем статические файлы в public/clamp
const publicClampPath = path.resolve(projectRoot, '../../public/clamp')

// Создаем директорию public/clamp если её нет
if (!fs.existsSync(publicClampPath)) {
  fs.mkdirSync(publicClampPath, { recursive: true })
  console.log('📁 Создана директория public/clamp')
}

// Функция для рекурсивного копирования директорий
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const files = fs.readdirSync(src)
  
  files.forEach(file => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)
    const stat = fs.statSync(srcPath)
    
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

// Копируем все файлы из сборки (кроме HTML файлов)
const files = fs.readdirSync(distPath)
files.forEach(file => {
  if (file === 'index.html' || file === '200.html') return // Пропускаем HTML файлы
  
  const srcPath = path.join(distPath, file)
  const destPath = path.join(publicClampPath, file)
  const stat = fs.statSync(srcPath)
  
  if (stat.isDirectory()) {
    copyDir(srcPath, destPath)
    console.log(`📁 Скопирована директория: ${file}`)
  } else {
    fs.copyFileSync(srcPath, destPath)
    console.log(`📄 Скопирован файл: ${file}`)
  }
})

console.log('✨ Развертывание завершено успешно!')
console.log('\n📋 Что было сделано:')
console.log('   • Сборка Nuxt.js приложения в статические файлы')
console.log('   • Обновление Twig шаблона converter.html.twig')
console.log('   • Копирование статических ресурсов в public/clamp/')
console.log('\n🎯 Теперь приложение доступно через Symfony роут!')