import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

import HomeView from '../views/LoginView.vue'
import UserProfileView from "../views/UserProfileView.vue"
import AdminEditView from '../views/AdminEditView.vue'
import AdminStatisticsView from '@/views/AdminStatisticsView.vue'
import FirefighterCallsView from '../views/FirefighterCallsView.vue'
import FirefighterReports from "../views/FirefighterReports.vue";
import DispatcherReportsView from "@/views/DispatcherReportsView.vue";
import DispatcherNewCall from "@/views/DispatcherNewCall.vue";
import DispatcherActiveCall from "@/views/DispatcherActiveCallView.vue";

const routes = [
  { path: '/', name: 'Login', component: HomeView },
  { path: '/userprofile', name: 'UserProfile', component: UserProfileView },
  { path: '/calls', name: 'FirefighterCalls', component: FirefighterCallsView },
  { path: '/ff-reports', name: 'FirefighterReports', component: FirefighterReports },
  { path: '/reports', name: 'DispatcherReports', component: DispatcherReportsView, meta: {requiredRole: 'dispatcher'} },
  {path: '/new-call', name: 'DispatcherNewCall', component: DispatcherNewCall, meta: {requiredRole: 'dispatcher'}},
  {path: '/active-calls', name: 'DispatcherActiveCall', component: DispatcherActiveCall, meta: {requiredRole: 'dispatcher'}},
  { path: '/edit', name: 'AdminEdit', component: AdminEditView, meta: {requiredRole: 'admin'}},
  { path: '/stats', name: 'Statistics', component: AdminStatisticsView, meta: {requiredRole: 'admin'}}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

//дожидаемся загрузки 
  if (!userStore.user) {
    await userStore.fetchUserData(); 
  }

  if (userStore.user && (to.meta.requiredRole === userStore.user.role || !to.meta.requiredRole)) {
    next();
  } else {
    next("/userprofile");
  }
});

export default router
