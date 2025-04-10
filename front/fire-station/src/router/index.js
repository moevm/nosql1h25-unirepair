import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

import HomeView from '../views/LoginView.vue'
import UserProfileView from "../views/UserProfileView.vue"
import AdminEditView from '../views/AdminEditView.vue'
import FirefighterCallsView from '../views/FirefighterCallsView.vue'
// import DispatcherReportsView from "@/views/DispatcherReportsView.vue";
import DispatcherNewCall from "@/views/DispatcherNewCall.vue";
// import DispatcherActiveCall from "@/views/DispatcherActiveCall.vue";

const routes = [
  { path: '/', name: 'Login', component: HomeView },
  { path: '/userprofile', name: 'UserProfile', component: UserProfileView },
  { path: '/calls', name: 'FirefighterCalls', component: FirefighterCallsView },
  // { path: '/reports', name: 'DispatcherReports', component: DispatcherReportsView },
  {path: '/new-call', name: 'DispatcherNewCall', component: DispatcherNewCall},
  // {path: '/active-calls', name: 'DispatcherActiveCall', component: DispatcherActiveCall},
  { path: '/edit', name: 'AdminEdit', component: AdminEditView, meta: {requiredRole: 'admin'}},
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
