<template>
  <div class="layout">
    <Sidebar :role="userRole" :fullName="userName" />
    <UserData
        :fullName="'Иванов Иван Иванович'"
        :role="'диспетчер'"
        :teamNumber="2"
        :status="'не на смене'"
        :phone="'+7 912 345 67 89'"
        :email="'ivanov@example.ru'"
        :address="'ул. Мира д. 0'"
        :login="'ivanov123'"
        :registeredAt="'01.01.25 10:00'"
        :updatedAt="'01.01.25 10:00'"
        :initialStatus="'не на смене'"
        @edit="editProfile"
        @status-changed="handleStatusChange"
    />
<!--    <div v-if="userData">-->
<!--      <UserData-->
<!--          :fullName="getFullName(userData)"-->
<!--          :role="userData.Role"-->
<!--          :teamNumber="userData.BrigadeNumber"-->
<!--          :phone="userData.Phone"-->
<!--          :email="userData.EMail"-->
<!--          :address="userData.Address"-->
<!--          :login="userData.Login"-->
<!--          :registeredAt="formatDate(userData.RegisteredAt)"-->
<!--          :updatedAt="formatDate(userData.ModifiedAt)"-->
<!--          :initialStatus="'не на смене'"-->
<!--          @status-changed="handleStatusChange"-->
<!--      />-->
<!--    </div>-->
<!--    <div v-else>-->
<!--      Загрузка данных...-->
<!--    </div>-->
  </div>
</template>

<script>

// import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import UserData from "../components/UserData.vue";

export default {
  name: 'UserProfileView',
  components: {UserData, Sidebar },
  data() {
    return {
      //userData: null,
      userRole: 'dispatcher',
      userName: 'Иванов Иван',
    }
  },
  methods: {
    editProfile() {
      console.log('Редактировать профиль')
    },
    handleStatusChange(newStatus) {
      console.log('Новый статус:', newStatus)
      // Можно отправить запрос на сервер или обновить глобальное состояние
    },
    // methods: {
    //   async fetchUser() {
    //     try {
    //       const response = await axios.get('/api/user/123')
    //       this.userData = response.data
    //     } catch (error) {
    //       console.error('Ошибка загрузки данных пользователя:', error)
    //     }
    //   },
    //   getFullName(user) {
    //     return `${user.FamilyName} ${user.FirstName} ${user.FatherName || ''}`.trim()
    //   },
    //   formatDate(dateStr) {
    //     const date = new Date(dateStr)
    //     return date.toLocaleString('ru-RU')
    //   },
    //   handleStatusChange(newStatus) {
    //     console.log('Новый статус:', newStatus)
    //     // здесь можно обновить на сервере, если нужно
    //   }
    // },
    // mounted() {
    //   this.fetchUser()
    // }
  },
}
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}
</style>
