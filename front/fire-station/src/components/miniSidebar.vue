<template>
  <nav class="sidebar__nav">
    <ul class="sidebar__list">
      <li :class="activeRoute === '/userprofile' ? 'sidebar__item sidebar__item--active' : 'sidebar__item'">
        <RouterLink to="/userprofile" class="sidebar__link">
          <img class="sidebar__icon" :src="userIcon" alt="account icon" />
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
  </nav>

</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default {
  name: 'miniSidebar',
  setup() {
    const route = useRoute()
    const userStore = useUserStore()
    const user = computed(() => userStore.user)

    const userIcon = '/icons/account_circle.svg'
    const activeRoute = computed(() => route.path)

    const roleBasedMenu = {
      dispatcher: [
        { icon: '/icons/add_form.svg', route: '/new-call' },
        { icon: '/icons/calls.svg', route: '/active-calls' },
        {  icon: '/icons/folder.svg', route: '/reports' },
      ]
    }

    const menuItems = computed(() => (user.value ? roleBasedMenu[user.value.role] || [] : []))

    return {
      menuItems,
      userIcon,
      activeRoute,
    }
  },
}
</script>

<style scoped>
.sidebar__nav {
  padding-top: 30px;
  box-sizing: border-box;
  width: 6vw;
  min-width: 80px;
  background-color: #CED0E9;
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

</style>
