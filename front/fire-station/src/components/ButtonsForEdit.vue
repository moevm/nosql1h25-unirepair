<template>
  <div class="buttons">
    <button class="button button__reports-btn"
            @click="showReports = !showReports; showEditReports = false"></button>

    <div v-if="showReports" class="reports-dropdown">
      <div v-for="report in reports" :key="report.id">
        {{ report.name }}
      </div>
    </div>

    <button class="button button__edit-reports-btn"
            @click="showEditReports = !showEditReports; showReports = false"></button>

    <div v-if="showEditReports" class="edit-reports-dropdown">
      <div>Rep_12.02.25_14:23_5-2</div>
      <div>Rep_15.03.25_18:20_5-2</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showReports = ref(false)
const showEditReports = ref(false)
const reports = ref([])

function updateReports(newReports) {
  reports.value = newReports
}

setTimeout(() => {
  updateReports([
    { id: 1, name: 'Rep_12.02.25_14:23_5-2' },
    { id: 2, name: 'Rep_15.03.25_18:20_5-2' },
    { id: 3, name: 'Rep_01.04.25_10:11_5-2' },
  ])
}, 1000)

</script>

<style scoped>
.button {
  position: absolute;
  width: 60px;
  height: 60px;
  background-color: #a7a3cc;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.button__reports-btn {
  bottom: 50px;
  right: 50px;
  background-image: url("/icons/addFile.svg");
  background-size: 45px;
}

.button__edit-reports-btn {
  bottom: 50px;
  right: 130px;
  background-image: url("/icons/edit-2.svg");
  background-size: 45px;
}

.reports-dropdown, .edit-reports-dropdown {
  position: absolute;
  bottom: 120px;
  right: 50px;
  background: #a7a3cc;
  color: black;
  border-radius: 10px;
  z-index: 10;
  cursor: pointer;
  padding: 15px 15px;
}

.edit-reports-dropdown {
  right: 130px;
}

.reports-dropdown div:hover {
  color: #fff;
}
</style>