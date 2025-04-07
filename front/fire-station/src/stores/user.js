import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    setUser(data) {
      this.user = data;
    },
    async fetchUserData(login, password) {
      // Заглушка для запроса данных с сервера
      // Здесь можно сделать реальный запрос с использованием fetch или axios
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Пример данных, которые приходят с сервера
          resolve({
            fullName: 'Иванов Иван Иванович',
            familyName: 'Иванов',
            firstName: 'Иван',
            fatherName: 'Иванович',
            role: 'firefighter',
            brigadeNumber: 5,
            address: 'ул. Ленина, 1',
            phone: '89001234567',
            email: 'ivanov@example.com',
            login: 'ivanov',
            passwordHash: 'hashedPassword123',
            registeredAt: '2023-01-01T00:00:00Z',
            modifiedAt: '2023-04-06T00:00:00Z',
            status: 'active',
          });
        }, 1000);
      });

      this.setUser(response);
    },
  },
});
