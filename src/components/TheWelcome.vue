<script setup lang="ts">

</script>

<template>
  <div class="greetings">
    <h1 class="green">Добро пожаловать в Clamp!</h1>
    <h3>
      Ваш Vue 3 подпроект готов к работе.
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

.green {
  color: hsla(160, 100%, 37%, 1);
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>