import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '', redirect: '/mainPage' },
  {
    path: '/mainPage',
    name: 'MainPage',
    component: () => import('../components/MainPage.vue')
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('../components/CreatePage.vue')
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('../components/LogPage.vue')
  },
  {
    path: '/video',
    name: 'VideoPage',
    component: () => import('../components/VideoPage.vue')
  },
  {
    // 录制声音
    path: '/makeSound',
    name: 'MakeSound',
    component: () => import('../components/MakeSound.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
