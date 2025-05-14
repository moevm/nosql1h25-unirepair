<template>
  <div class="layout">
    <miniSidebar style="z-index: 0;"/>
    <fireReport
        style="z-index: 1;"
        :call-data="callData"
    />
  </div>
</template>

<script>

import miniSidebar from "@/components/miniSidebar.vue";
import fireReport from "@/components/fireReport.vue";
import query from "@/common/query.js";
import { useRoute } from 'vue-router';

export default {
  name: 'DispatcherNewCall',
  components: { miniSidebar, fireReport },
  data() {
    return {
      callData: null
    }
  },
  async mounted() {
    const route = useRoute();
    const createdAt = route.query.createdAt;
    if (createdAt) {
      try {
        const res = await query('callform_search', { createdAt});
        this.callData = res;
      } catch (error) {
        console.error('Ошибка получения вызова:', error);
      }
    }
  }
}

</script>

<style scoped>
.layout {
  display: flex;
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>