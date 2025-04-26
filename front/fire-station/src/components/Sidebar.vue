<template>
  <nav class="sidebar__nav">
    <ul class="sidebar__list">
      <li :class="activeRoute === '/userprofile' ? 'sidebar__item sidebar__item--active' : 'sidebar__item'">
        <RouterLink to="/userprofile" class="sidebar__link">
          <img class="sidebar__icon" :src="userIcon" alt="account icon" />
          {{ fullName }}
        </RouterLink>
      </li>
      <li
          v-for="(item, index) in menuItems"
          :key="index"
          :class="['sidebar__item', { 'sidebar__item--active': item.route === activeRoute }]"
      >
        <RouterLink :to="item.route" class="sidebar__link">
          <img class="sidebar__icon" :src="item.icon" :alt="item.label + ' icon'" />
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
    <div class="sidebar__logout">
      <a href="#" class="sidebar__exit" @click="logout">
        <img class="sidebar__icon" src="/icons/logout.svg" alt="logout icon" />
      </a>
    </div>
  </nav>

</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default {
  name: 'Sidebar',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const user = computed(() => userStore.user)

    const userIcon = '/icons/account_circle.svg'
    const activeRoute = computed(() => route.path)

    const roleBasedMenu = {
      fireman: [
        { label: 'Вызовы', icon: '/icons/alert.svg', route: '/calls' },
        { label: 'Отчёты', icon: '/icons/folder.svg', route: '/ff-reports' },
      ],
      brigadier: [
        { label: 'Вызовы', icon: '/icons/alert.svg', route: '/calls' },
        { label: 'Отчёты', icon: '/icons/folder.svg', route: '/ff-reports' },
      ],
      operator: [
        { label: 'Новая форма', icon: '/icons/add_form.svg', route: '/new-call' },
        { label: 'Текущие вызовы', icon: '/icons/calls.svg', route: '/active-calls' },
        { label: 'Отчёты', icon: '/icons/folder.svg', route: '/reports' },
      ],
      admin: [
        { label: 'Статистика', icon: '/icons/statistics.svg', route: '/stats' },
        { label: 'Редактировать', icon: '/icons/edit.svg', route: '/edit' },
      ],
    }

    const menuItems = computed(() => (user.value ? roleBasedMenu[user.value.role] || [] : []))

    const logout = () => {
      const userStore = useUserStore();
      console.log('Выход из профиля...');

      userStore.setUser(null);  // Удаляем пользователя из хранилища
      localStorage.removeItem('user');  // Если хранишь в localStorage
      sessionStorage.removeItem('user');  // Если хранишь в sessionStorage

      // Перенаправить на страницу входа
      router.push('/')
    }

    const fullName = computed(() => (user.value ? user.value.fullName : ''))

    return {
      menuItems,
      userIcon,
      activeRoute,
      logout,
      fullName,
    }
  },
}
</script>

<style scoped>
.sidebar__nav {
  padding-top: 30px;
  box-sizing: border-box;
  min-width: 20vw;
  width: 20vw;
  height: 100vh;
  background-color: #A7A3CC;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 90%;
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  position: absolute;
  right: 0;
}

.sidebar__item {
  width: 100%;
}

.sidebar__item--active {
  border-radius: 20px 0 0 20px;
  background-color: #766EBF;
}

.sidebar__link {
  display: flex;
  align-items: center;
  padding: 4px 5px;
  color: black;
  text-decoration: none;
  font-size: 18px;
}

.sidebar__link:hover {
  border-radius: 20px 0 0 20px;
  background-color: #766EBF;
}

.sidebar__icon {
  padding-right: 10px;
  width: 50px;
  height: 50px;
}

.sidebar__logout {
  margin-top: auto;
  margin-right: auto;
}

.sidebar__exit {
  display: block;
  padding: 15px;
  text-decoration: none;
}

</style>