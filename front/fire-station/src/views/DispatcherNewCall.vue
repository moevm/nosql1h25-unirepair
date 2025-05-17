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
import range from "@/common/range.js";

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
    console.log("Получены параметры:", route.query);
    console.log("DispatcherNewCall recieved createdAt:", createdAt);
    if (createdAt) {
      try {
        const res = await query('callform_search', { createdAt: range(createdAt),
          status:"Incomplete"});
        console.log("Данные вызова full:", res);
        this.callData = res[res.length-1];
        console.log("DispatcherNewCall callData", this.callData);
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
