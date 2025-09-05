import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import CreatePage from '../components/CreatePage.vue'
import LogPage from '../components/LogPage.vue'
import VideoPage from '../components/VideoPage.vue'
import MakeSound from '../components/MakeSound.vue' // 录制声音

const routes = [
  { path: '', redirect: '/mainPage' },
  {
    path: '/mainPage',
    name: 'MainPage',
    component: MainPage
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
  },
  {
    path: '/video',
    name: 'VideoPage',
    component: VideoPage
  },
  {
    // 录制声音
    path: '/makeSound',
    name: 'MakeSound',
    component: MakeSound
  },
]

const router = createRouter({
  history: createWebHistory('/testenvironment/'),
  routes
})

export default router
