import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/LoginView.vue'
import UserProfileView from "../views/UserProfileView.vue"
import AdminEditView from '../views/AdminEditView.vue'
// import FirefighterCallsView from '../views/FirefighterCallsView.vue'


const routes = [
  { path: '/', name: 'Login', component: HomeView },
  { path: '/userprofile', name: 'UserProfile', component: UserProfileView },
  //{ path: '/calls', name: 'FirefighterCalls', component: FirefighterCallsView },
  //{ path: '/reports', name: 'Reports', component: ReportsView },
  { path: '/edit', name: 'AdminEdit', component: AdminEditView},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
