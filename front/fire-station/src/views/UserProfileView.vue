
<template>
  <div class="layout">
    <Sidebar class="sidebar"/>

    <template v-if="showEditForm">
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

const showEditForm = ref(false);
const currentUser = ref(null);
const handleEdit = (userData) => {
  showEditForm.value = true
  currentUser.value = userData

}
const handleSave = (updatedUser) => {
  //как я понимаю здесь данные должны отдаваться бд
  showEditForm.value = false
}
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}
</style>
