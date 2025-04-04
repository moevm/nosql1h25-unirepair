<template>
  <div class="login-container">
    <div class="login-box">
      <label for="login">Введите логин:</label>
      <input id="login" v-model="login" type="text" class="login-input" />

      <label for="password">Введите пароль:</label>
      <input id="password" v-model="password" type="password" class="login-input" />

      <button class="login-button" @click="handleLogin">Войти</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      login: '',
      password: ''
    };
  },
  methods: {
    handleLogin() {
      console.log('Попытка входа с логином:', this.login);
    }
  }
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

.login-button {
  background: #7a67c3;
  color: white;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  border-radius: 4px;
}

.login-button:hover {
  background: #6757a3;
}
</style>
