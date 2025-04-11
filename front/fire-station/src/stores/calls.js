import { defineStore } from 'pinia'

export const useCallsStore = defineStore('calls', {
  state: () => ({
    //calls: [],
    calls: [{
      "status": "Incomplete",
      "createdAt": "2025-04-01T09:00:00Z",
      "modifiedAt": "2025-04-01T10:30:00Z",
      "callSource": "телефонный звонок",
      "fireAddress": "г. Санкт-Петербург, ул. Ленина, д. 1",
      "bottomLeft": { "latitude": 59.831643, "longitude": 30.089879 },
      "topRight": { "latitude": 59.832448, "longitude": 30.089358 },
      "fireType": "лесной пожар",
      "fireRank": "3",
      "victimsCount": 0,
      "assignedTo": null,
      "auto": null
    },
      {
        "status": "Incomplete",
        "createdAt": "2025-03-20T15:00:00Z",
        "modifiedAt": "2025-03-20T16:45:00Z",
        "callSource": "автоматическая система",
        "fireAddress": "г. Санкт-Петербург, ул. Гоголя, д. 20",
        "bottomLeft": { "latitude": 59.9343, "longitude": 30.3351 },
        "topRight": { "latitude": 59.9350, "longitude": 30.3360 },
        "fireType": "заводской пожар",
        "fireRank": "2",
        "victimsCount": 3,
        "assignedTo": 4,
        "auto": "АЦ A123BC"
      }
      ] // массив вызовов
  }),
  actions: {
    setCalls(data) {
      this.calls = data
    },
    addCall(call) {
      this.calls.push(call)
    },
    clearCalls() {
      this.calls = []
    },
  }
})
