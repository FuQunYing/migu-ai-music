import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'; // 导入 Pinia

const app = createApp(App);
app.use(router).mount('#app')
app.use(createPinia()); // 注册 Pinia