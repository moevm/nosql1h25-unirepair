<template>
  <div class="reports__container">
    <div class="reports">
      <div class="reports__header">
        <span class="reports__header-title">Отчеты оператора</span>
      </div>

      <div class="reports__files">
        <div
          v-for="report in reports"
          @click="$emit('openReport', report)"
          class="reports__file"
        >
          <img class="icon-file" src="/icons/file-text.svg" alt="file-text" />
          <span class="file_name">{{ formReportName(report) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { ref, computed } from "vue";
import query from "../common/query.js";

let reports = ref([]);
query("operator_callforms", { login: useUserStore().user.login }).then(
  (res) => (reports.value = res.complete_callforms),
);
const formReportName = (r) => {
  return `Rep_${r.createdAt}_B-${r.assignedTo}`;
};
</script>

<style scoped>
.reports__container {
  padding: 20px;
  margin: 0;
  background-color: #ced0e9;
  width: 100vw;
}
.reports {
  box-sizing: border-box;
  min-width: 70vw;
  width: 100%;
  background: #fff;
  padding: 24px;
  height: 95vh;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.reports__header {
  display: flex;
  gap: 10px;
  padding: 0 20px 10px;
  margin: 0 -24px;
  border-bottom: #ced0e9 5px solid;
  justify-content: center;
  align-items: center;
}

.reports__header-title {
  font-weight: bold;
  font-size: x-large;
}

.reports__files {
  padding-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  overflow-y: auto;
  max-height: 78vh;
}

.reports__file {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 70px;
  font-size: 12px;
}

.reports__file:hover {
  background-color: #a7a3cc;
  border-radius: 3px;
}
.icon-file {
  width: 70px;
  height: 70px;
}
.file_name {
  display: block;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding-bottom: 5px;
}
</style>
