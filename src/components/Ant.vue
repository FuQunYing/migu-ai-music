<script setup>
import { Chart } from '@antv/g2';
import { onMounted } from "vue";
let baseUrl = import.meta.env.VITE_BASE_URL
const maskImage = new Image()
maskImage.src = 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*07tdTIOmvlYAAAAAAAAAAABkARQnAQ'
onMounted(() => {
  setTimeout(() => {
    init()
  })
})
function init() {
  const chart = new Chart({
    container: 'container',
    width: 800,
    height: 800,
  });

  chart
      .wordCloud()
      .data({
        type: 'fetch',
        value: 'https://assets.antv.antgroup.com/g2/philosophy-word.json',
      })
      .layout({
        imageMask:baseUrl+'/cgtntest/avatar/wEcWWjo6.png',
        // imageMask:'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*07tdTIOmvlYAAAAAAAAAAABkARQnAQ',
        fontSize: 8,
        rotate: 0,
        // spiral: 'archimedean', // 阿基米德
        // spiral: 'rectangular', // 矩形
      })
      .style({
        color: '#f00'
      })
      // .encode('color', 'name')
      .encode('text', 'name')
      .legend(false)
      .axis(false)
      .tooltip(false)

  chart.render();
}
</script>

<template>
<div style="text-align: center">
  <div id="container"></div>
</div>
</template>

<style scoped>
#container{
  height: 100vh;
  width: 100vw;
}
</style>