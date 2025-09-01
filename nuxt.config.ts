export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt'
  ],
  ssr: false,
  nitro: {
    prerender: {
      routes: ['/'],
      failOnError: false
    }
  },
  app: {
    baseURL: '/clamp/',
    buildAssetsDir: 'assets/',
    cdnURL: ''
  },
  devServer: {
    port: 3000
  },
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false
  },
  pages: false
})