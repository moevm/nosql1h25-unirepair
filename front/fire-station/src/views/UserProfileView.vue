<template>
  <div class="layout">
    <Sidebar/>
    <UserData/>
  </div>
</template>

<script>

import Sidebar from '../components/Sidebar.vue'
import UserData from "../components/UserData.vue";

export default {
  name: 'UserProfileView',
  components: { UserData, Sidebar },
}
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}
</style>
