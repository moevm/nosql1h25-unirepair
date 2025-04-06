<template>
  <section class="profile">
    <div class="profile__header">
      <div class="profile__avatar"></div>
      <div class="profile__info">
        <p class="profile__name"><strong>ФИО:</strong> {{ fullName }}</p>
        <p class="profile__position"><strong>Должность:</strong> {{ role }}</p>
        <p class="profile__team"><strong>Бригада:</strong> №{{ teamNumber }}</p>
        <p
            class="profile__status"
            :class="isOnShift ? 'profile__status_active' : 'profile__status_inactive'"
        >
          <strong>Статус:</strong> {{ isOnShift ? 'на смене' : 'не на смене' }}
        </p>
      </div>
    </div>

    <div class="profile__contact-settings">
      <h3 class="profile__contact-settings-header">Контактная информация:</h3>
      <p class="profile__contact-settings-item"><strong>Тел.:</strong> {{ phone }}</p>
      <p class="profile__contact-settings-item"><strong>Email:</strong> {{ email }}</p>
      <p class="profile__contact-settings-item"><strong>Адрес:</strong> {{ address }}</p>
      <h3 class="profile__contact-settings-header">Настройки:</h3>
      <p class="profile__contact-settings-item"><strong>Логин:</strong> {{ login }}</p>
      <p class="profile__contact-settings-item"><strong>Дата регистрации:</strong> {{ registeredAt }}</p>
      <p class="profile__contact-settings-item"><strong>Последнее редактирование:</strong> {{ updatedAt }}</p>
    </div>

    <div class="profile__buttons">
      <button class="button button_secondary" @click="$emit('edit')">Редактировать данные</button>
      <button class="button button_primary" @click="toggleShift">
        {{ isOnShift ? 'Завершить смену' : 'Начать смену' }}
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'UserData',
  props: {
    fullName: String,
    role: String,
    teamNumber: Number,
    status: String,
    phone: String,
    email: String,
    address: String,
    login: String,
    registeredAt: String,
    updatedAt: String,
    initialStatus: {
      type: String,
      default: 'не на смене',
    },
  },
  data() {
    return {
      isOnShift: this.initialStatus === 'на смене',
    }
  },
  methods: {
    toggleShift() {
      this.isOnShift = !this.isOnShift
      this.$emit('status-changed', this.isOnShift ? 'на смене' : 'не на смене')
    },
  },
}
</script>

<style scoped>
.profile {
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

.profile__avatar {
  width: 80px;
  height: 80px;
  background: #D9D9D9;
  border-radius: 50%;
}

.profile__info {
  flex-grow: 1;
}

.profile__name,
.profile__position,
.profile__team,
.profile__status {
  margin: 4px 0;
}

.profile__status_active {
  color: green;
}

.profile__status_inactive {
  color: red;
}

.profile__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}


.profile__contact-settings {
  background: #D9D9D9;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.profile__contact-settings-item {
  margin: 5px 0;
}

.profile__buttons {
  display: flex;
  justify-content: space-between;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 18px;
}

.button_primary {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: #B2FFBA;
}

.button_secondary {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: #A7A3CC;
}
</style>
