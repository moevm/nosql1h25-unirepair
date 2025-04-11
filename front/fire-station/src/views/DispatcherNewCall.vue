<template>
  <div class="layout">
    <miniSidebar/>
    <fireReport/>
  </div>
</template>

<script>

import miniSidebar from "@/components/miniSidebar.vue";
import fireReport from "@/components/fireReport.vue";
export default {
  name: 'DispatcherNewCall',
  components: { miniSidebar, fireReport },
}
</script>

<style scoped>
.layout {
  display: flex;
  margin: 0;
  padding: 0;
  width: 100vw;
}
</style>