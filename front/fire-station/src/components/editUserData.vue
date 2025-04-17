<template>
  <div v-if="userData" class="edit-form">
  <section class="edit_profile">
    <div v-if="userData" class="profile__header">
      <div class="edit_profile__avatar"></div>
      <div class="edit_profile__info">
        <p class="edit_profile__name"><strong>ФИО:</strong> {{ userData.fullName }}</p>
        <p class="edit_profile__position"><strong>Должность:</strong> {{ userData.role }}</p>
      </div>
    </div>
    <div v-if="userData" class="edit_profile__contact-settings">
      <h3 class="edit_profile__contact-settings-header">Контактная информация:</h3>
      <div class="input-group">
      <label>
        <strong>Тел.:</strong>
        <input type="tel" v-model="userData.phone" class="edit_profile__contact-settings-item">
      </label>
      </div>

      <div class="input-group">
      <label>
        <strong>Email:</strong>
        <input type="email" class="edit_profile__contact-settings-item" v-model="userData.email">
      </label>
      </div>

      <div class="input-group">
      <label>
        <strong>Адрес:</strong>
        <input type="text" class="edit_profile__contact-settings-item" v-model="userData.address ">
      </label>
      </div>

      <h3 class="edit_profile__contact-settings-header">Настройки:</h3>

      <div class="input-group">
      <label>
        <strong>Логин:</strong>
        <input type="text" class="edit_profile__contact-settings-item" v-model="userData.login ">
      </label>
      </div>

      <div class="input-group">
      <label>
        <strong>Пароль:</strong>
        <input type="password" class="edit_profile__contact-settings-item" v-model="userData.login ">
      </label>
      </div>
      <div class="buttons">
        <button class="close_button" @click="$emit('close')">Отмена</button>
        <button class="submit_button" @click="$emit('save')">Ок</button>
      </div>
    </div>
  </section>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
});

defineEmits(['close'])
const formData = ref({...props.userData});

const saveChanges = () => {
  emit('save', formData.value);
  emit('close');
};
</script>

<style scoped>

.edit_profile {
  position: relative;
  box-sizing: border-box;
  margin: 24px;
  min-width: 70vw;
  width: 100%;
  min-height: 90vh;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.edit_profile__avatar {
  width: 80px;
  height: 80px;
  background: #d9d9d9;
  border-radius: 50%;
}

.input-group{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.input-group label {
  font-weight: bold;
  margin-bottom: 4px;
  padding-left: 4px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-group input {
  border: 1px solid #ccc;
  border-radius: 2px;
  box-sizing: border-box;
}

.edit_profile__info {
  flex-grow: 1;
}
.edit_profile__name,
.edit_profile__position
 {
  margin: 4px 0;
}

.profile__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}


.edit_profile__contact-settings {
  background: #d9d9d9;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;

}

.edit_profile__contact-settings-item {
  margin: 5px 0;
}

.buttons {
  height: 40px;
  display: flex;
  justify-content: space-between;
  padding: 0 24px;
  align-items: center;
}
.close_button{
  border: none;
  border-radius: 3px;
  height: 20px;
  width: 80px;
  background-color: #a7a3cc;
}
.submit_button{
  height: 20px;
  width: 80px;
  border: none;
  border-radius: 3px;
  background-color: #a7a3cc;
}

.submit_button:hover, .close_button:hover{
  background-color: #766EBF;
}
</style>
