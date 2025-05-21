<template>
    <section class="profile">
        <div v-if="user" class="profile__header">
            <div class="profile__avatar"></div>
            <div class="profile__info">
                <p class="profile__name">
                    <strong>ФИО:</strong> {{ user.fullName }}
                </p>
                <p class="profile__position">
                    <strong>Должность:</strong> {{ user.role }}
                </p>
                <p
                    v-if="['firefighter', 'Brigadier'].includes(user.role)"
                    class="profile__team"
                >
                    <strong>Бригада:</strong> №{{ user.brigadeNumber }}
                </p>
                <p
                    class="profile__status"
                    :class="
                        isOnShift
                            ? 'profile__status_active'
                            : 'profile__status_inactive'
                    "
                >
                    <strong>Статус:</strong>
                    {{ isOnShift ? "на смене" : "не на смене" }}
                </p>
            </div>
        </div>

        <div v-if="user" class="profile__contact-settings">
            <h3 class="profile__contact-settings-header">
                Контактная информация:
            </h3>
            <p class="profile__contact-settings-item">
                <strong>Тел.:</strong> {{ user.phone }}
            </p>
            <p class="profile__contact-settings-item">
                <strong>Email:</strong> {{ user.email }}
            </p>
            <p class="profile__contact-settings-item">
                <strong>Адрес:</strong> {{ user.address }}
            </p>
            <h3 class="profile__contact-settings-header">Настройки:</h3>
            <p class="profile__contact-settings-item">
                <strong>Логин:</strong> {{ user.login }}
            </p>
            <p class="profile__contact-settings-item">
                <strong>Дата регистрации:</strong> {{ user.registeredAt }}
            </p>
            <p class="profile__contact-settings-item">
                <strong>Последнее редактирование:</strong> {{ user.modifiedAt }}
            </p>
        </div>

        <div class="profile__buttons">
            <button
                class="button button_secondary"
                @click="$emit('edit', user)"
            >
                Редактировать данные
            </button>
            <button class="button button_primary" @click="toggleShift">
                {{ isOnShift ? "Завершить смену" : "Начать смену" }}
            </button>
        </div>
    </section>
</template>

<script>
import { computed, ref } from "vue";
import { useUserStore } from "@/stores/user";

export default {
  name: "UserData",
  setup(_, { emit }) {
    const userStore = useUserStore();
    const user = computed(() => userStore.user);

    const isOnShift = computed(() => userStore.isOnShift);;

    const toggleShift = () => {
      userStore.toggleShift();
      emit('status-changed', userStore.isOnShift ? 'на смене' : 'не на смене');
    };

    return {
      user,
      isOnShift,
      toggleShift,
    };
  },
};
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
    border-radius: 13px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile__avatar {
    width: 80px;
    height: 80px;
    background: #d9d9d9;
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
    background: #d9d9d9;
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
    background-color: #b2ffba;
}

.button_secondary {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: #a7a3cc;
}

@media (max-width: 768px) {
  .profile__avatar {
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;
    background: #d9d9d9;
    border-radius: 50%;
  }

  .profile__buttons {
    display: flex;
    flex-direction: column-reverse;
    height: 150px;
    gap: 16px;
    justify-content: flex-end;

  }
  .button_secondary {
    height: 40px;
    position: static;
  }

  .button_primary {
    height: 40px;
    position: static;
}

}
</style>
