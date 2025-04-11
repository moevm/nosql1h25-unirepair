import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

import HomeView from '../views/LoginView.vue'
import UserProfileView from "../views/UserProfileView.vue"
import AdminEditView from '../views/AdminEditView.vue'
import AdminStatisticsView from '@/views/AdminStatisticsView.vue'
// import FirefighterCallsView from '../views/FirefighterCallsView.vue'

const routes = [
  { path: '/', name: 'Login', component: HomeView },
  { path: '/userprofile', name: 'UserProfile', component: UserProfileView },
  //{ path: '/calls', name: 'FirefighterCalls', component: FirefighterCallsView },
  //{ path: '/reports', name: 'Reports', component: ReportsView },
  { path: '/edit', name: 'AdminEdit', component: AdminEditView, meta: {requiredRole: 'admin'}},
  { path: '/stats', name: 'Statistics', component: AdminStatisticsView, meta: {requiredRole: 'admin'}}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = useUserStore().user;
  
  if(to.meta.requiredRole === user.role || !to.meta.requiredRole){
    next()
  }
  else{
    next('/userprofile')
  }
})

export default router
