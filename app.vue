<template>
  <main>
    <ClampConverter />
  </main>
</template>

<script setup>
useHead({
  title: 'CSS Clamp Converter',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Удобный калькулятор CSS clamp() функции для создания адаптивных размеров' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
}

* {
  box-sizing: border-box;
}
</style>