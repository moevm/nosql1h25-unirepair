<template>
  <div class="login-container">
    <form class="login-box" @submit.prevent="handleLogin">
      <label for="login">Введите логин:</label>
      <input
        id="login"
        name="login"
        v-model="login"
        type="text"
        class="login-input"
        autocomplete="username"
      />

      <label for="password">Введите пароль:</label>
      <input
        id="password"
        name="password"
        v-model="password"
        type="password"
        class="login-input"
        autocomplete="current-password"
      />

      <button class="button login-button" type="submit">Войти</button>
    </form>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/user";
import query from "../common/query.js";

export default {
  name: "LoginView",
  data() {
    return {
      login: "",
      password: "",
    };
  },
  methods: {
    async handleLogin() {
      const userStore = useUserStore();
      try {
        const data = await query("login_user", {
          login: this.login,
          password: this.password,
        });
        if (data === null) return;

        const transformedUser = {
          fullName: `${data.familyName} ${data.firstName} ${data.fatherName}`,
          familyName: data.familyName,
          firstName: data.firstName,
          fatherName: data.fatherName,
          role: this.getRoleFromLabels(data.labels),
          status: this.getStatusFromLabels(data.labels),
          brigadeNumber: data.brigadeNumber,
          address: data.address,
          phone: data.phone,
          email: data.email,
          login: data.login,
          password: data.password,
          registeredAt: data.registeredAt,
          modifiedAt: data.modifiedAt,
        };

        console.log(transformedUser.registeredAt);
        userStore.setUser(transformedUser);
        this.$router.push("/userprofile");
      } catch (error) {
        console.error("Ошибка при попытке входа:", error);
        alert("Не удалось выполнить вход. Попробуйте позже.");
      }
    },
    getRoleFromLabels(labels) {
      const roles = ["Fireman", "Brigadier", "Operator", "Admin"];
      return (
        labels.find((label) => roles.includes(label))?.toLowerCase() ||
        "unknown"
      );
    },

    getStatusFromLabels(labels) {
      return labels.includes("Active")
        ? "active"
        : labels.includes("Blocked")
          ? "blocked"
          : "unknown";
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #c8c8e5;
}

.login-box {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  font-size: 16px;
}

.login-input {
  min-width: 250px;
  padding: 5px;
  border: 1px solid black;
  border-radius: 3px;
  font-size: 16px;
}

.button {
  background: #7a67c3;
  color: white;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  border-radius: 4px;
}

.button:hover {
  background: #6757a3;
}
</style>
