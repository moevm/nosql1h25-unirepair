import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/LoginView.vue'
import UserProfileView from "../views/UserProfileView.vue"


const routes = [
  { path: '/', name: 'Login', component: HomeView },
  { path: '/userprofile', name: 'UserProfile', component: UserProfileView },
  //{ path: '/reports', name: 'Reports', component: ReportsView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
