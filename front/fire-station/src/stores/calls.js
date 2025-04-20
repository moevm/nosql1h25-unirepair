import { defineStore } from 'pinia'

export const useCallsStore = defineStore('calls', {
  state: () => ({
    calls: [],
  }),
  actions: {
    setCalls(data) {
      this.calls = data
    },
  }
})
