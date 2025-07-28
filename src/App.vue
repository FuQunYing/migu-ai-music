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
html,body{
  width: 100vw;
  overflow-x: hidden;
  touch-action: manipulation;  /* 禁用双指缩放 */
  user-select: none;          /* 禁用文本选择 */
  -webkit-touch-callout: none; /* 禁用长按菜单 */
}
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
