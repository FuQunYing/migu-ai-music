import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import CreatePage from '../components/CreatePage.vue'
import LogPage from '../components/LogPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HelloWorld
  },
  {
    path: '/create',
    name: 'Create',
    component: CreatePage
  },
  {
    path: '/logs',
    name: 'Logs',
    component: LogPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
