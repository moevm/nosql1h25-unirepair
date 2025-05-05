<template>
  <div class="layout">
    <Sidebar />
    <div class="block">
      <div class="calls__header">
        <span class="calls__header-title">Текущие вызовы</span>
      </div>
      <dispatcherCall v-for="call in calls" :key="call.id" :call="call" />
      <dispatcherCall v-for="call in calls" :key="call.id" :call="call" />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import dispatcherCall from "../components/dispatcherCall.vue";
import { useUserStore } from "../stores/user.js";
import { ref } from "vue";
import query from "../common/query.js";

let calls = ref([]);
query("operator_callforms", { login: useUserStore().user.login }).then(
  (res) => (calls.value = res.incomplete_callforms),
);
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #ced0e9;
  min-height: 100vh;
}
.calls__header {
  display: flex;
  margin-left: 24px;
  margin-right: 24px;
  margin-top: 24px;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  position: sticky;
  top: 0;
}
.calls__header-title {
  font-weight: bold;
  font-size: x-large;
}

.block {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;
  max-height: 100vh;
}
</style>
