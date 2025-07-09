<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld/>
    </div>
  </header>

</template>

<style>
html,body,div,p{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app{
  transform-origin: left top;
  &::-webkit-scrollbar{
    display: none;
  }
}
</style>
