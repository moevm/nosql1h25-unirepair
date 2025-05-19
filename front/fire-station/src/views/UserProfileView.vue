
<template>
  <div class="layout">
    <Sidebar class="sidebar"/>

    <template v-if="showEditForm" class="block">
      <editUserData
          :userData="currentUser"
          @close="showEditForm = false"
          @save="handleSave"
      />
    </template>

    <template v-else>
      <UserData
          @edit="handleEdit"
      />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import UserData from "../components/UserData.vue";
import editUserData from "../components/editUserData.vue";
import query from "@/common/query.js";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const showEditForm = ref(false);
const currentUser = ref(null);
const handleEdit = (userData) => {
  showEditForm.value = true
  currentUser.value = userData

}
const handleSave = async (updatedUser) => {
  try {
    const response = await query("modify_user", updatedUser);
    userStore.updateUser(response);
    showEditForm.value = false;
  } catch (error) {
    console.error("Ошибка при сохранении данных пользователя:", error);
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}

@media (max-width: 768px) {
  .layout {
    display: flex;
    background-color: #CED0E9;
  }
  .sidebar {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    max-height: 80px;
    z-index: 10;
    height: 12vh;
    min-height: 55px;
  }
  .block{
    height: 88vh;
  }
}
</style>
