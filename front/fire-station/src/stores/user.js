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
  },
});
