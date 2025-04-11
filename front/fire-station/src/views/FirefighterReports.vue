<template>
  <div class="layout">
    <Sidebar class="sidebar"/>
    <template v-if="showReport">
      <Report class="block" @close="showReport = false" :reportData="currentReport" />
    </template>

    <template v-else>
      <Reports class="block" @openReport="openReport"/>
      <ButtonsForEdit/>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from "@/components/Sidebar.vue";
import Reports from "@/components/Reports.vue";
import ButtonsForEdit from "@/components/ButtonsForEdit.vue";
import Report from "@/components/Report.vue";

const showReport = ref(false)
const currentReport = ref(null)

function openReport(reportData) {
  currentReport.value = reportData
  showReport.value = true
}

</script>

<style scoped>
.layout {
  display: flex;
  background-color: #ced0e9;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
}

.block {
  margin-left: 22vw;
}
</style>