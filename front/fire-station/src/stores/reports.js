import { defineStore } from 'pinia'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    reports: [],
  }),
  actions: {
    setReports(data) {
      this.reports = data
    },
  }
})