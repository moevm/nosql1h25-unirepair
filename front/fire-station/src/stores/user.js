import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  persist: true,
  actions: {
    setUser(data) {
      this.user = data;
    },
    updateUser(partialUser) {
      if (!this.user) return;

      Object.entries(partialUser).forEach(([key, value]) => {
        if (key in this.user) {
          this.user[key] = value;
        }
      });
    }
  },
});
