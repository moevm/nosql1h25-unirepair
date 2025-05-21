import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isOnShift: false,
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
    },
    toggleShift() {
      this.isOnShift = !this.isOnShift;
    }
  },
});
