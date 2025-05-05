import { defineStore } from 'pinia'

export const useCallsStore = defineStore('calls', {
  state: () => ({
    calls: [],
  }),
  actions: {
    setCalls(newCalls) {
      if (newCalls.length !== this.calls.length) {
        this.calls = newCalls;
        return;
      }

      const hasChanged = newCalls.some(newCall => {
        const existingCall = this.calls.find(c => c.id === newCall.id);
        return !existingCall || (existingCall.modifiedAt !== newCall.modifiedAt);
      });

      if (hasChanged) {
        this.calls = newCalls;
      }
    },
  }
});

