
<template>
  <div class="layout">
    <Sidebar/>
    <template v-if="showReport">
      <Report class="report" @close="closeReport" :reportData="currentReport" />
    </template>
    <template v-else>
      <dispatcherReports @openReport="openReport"/>
    </template>
  </div>
</template>

<script>
import { ref } from 'vue'
import Sidebar from "@/components/Sidebar.vue";
import dispatcherReports from "@/components/dispatcherReports.vue";
import Report from "@/components/dispatcherReport.vue";

export default {
  name: 'DispatcherReportsView',
  components: { Sidebar, dispatcherReports, Report },
  setup() {
    const showReport = ref(false)
    const currentReport = ref(null)

    const openReport = (reportData) => {
      currentReport.value = reportData
      showReport.value = true
    }

    const closeReport = () => {
      showReport.value = false
      currentReport.value = null
    }

    return {
      showReport,
      currentReport,
      openReport,
      closeReport
    }
  }
}
</script>


<style scoped>
.layout {
  display: flex;
  margin: 0;
  padding: 0;
  width: 100vw;
  background-color: #CED0E9;
}
</style>