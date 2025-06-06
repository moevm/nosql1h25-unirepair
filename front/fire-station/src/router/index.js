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
import DBView from '@/views/DB/DBView.vue'
import UsersView from '@/views/DB/UsersView.vue'
import CallFormsView from '@/views/DB/CallFormsView.vue'
import ReportsView from '@/views/DB/ReportsView.vue'
import InventoryView from '@/views/DB/InventoryView.vue'

const routes = [
  { path: '/', name: 'Login', component: HomeView },
  { path: '/userprofile', name: 'UserProfile', component: UserProfileView },
  { path: '/calls', name: 'FirefighterCalls', component: FirefighterCallsView },
  { path: '/ff-reports', name: 'FirefighterReports', component: FirefighterReports },
  { path: '/reports', name: 'DispatcherReports', component: DispatcherReportsView, meta: {requiredRole: 'operator'} },
  {path: '/new-call', name: 'DispatcherNewCall', component: DispatcherNewCall, meta: {requiredRole: 'operator'}},
  {path: '/active-calls', name: 'DispatcherActiveCall', component: DispatcherActiveCall, meta: {requiredRole: 'operator'}},
  { path: '/edit', name: 'AdminEdit', component: AdminEditView, meta: {requiredRole: 'admin'}},
  { path: '/stats', name: 'Statistics', component: AdminStatisticsView, meta: {requiredRole: 'admin'}},
  { path: '/db', name: 'DataBase', component: DBView, meta: {requiredRole: 'admin'}},
  { path: '/db/users', name: 'DB_Users', component: UsersView, meta: {requiredRole: 'admin'}},
  { path: '/db/callforms', name: 'DBCallForms', component: CallFormsView, meta: {requiredRole: 'admin'}},
  { path: '/db/reports', name: 'DBReports', component: ReportsView, meta: {requiredRole: 'admin'}},
  { path: '/db/inventory', name: 'DBInventory', component: InventoryView, meta: {requiredRole: 'admin'}},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const isAuthorized = !!userStore.user
  const requiredRole = to.meta.requiredRole

  if (isAuthorized && (!requiredRole || userStore.user.role === requiredRole)) {
    return next()
  }

  const publicPages = ['/', '/login', '/register']
  if (!isAuthorized && publicPages.includes(to.path)) {
    return next()
  }

  return next('/')
})

export default router
