<template>
  <div class="layout">
    <Sidebar/>
    <div class="block">
      <div class="calls__header">
        <span class="calls__header-title">Текущие вызовы</span>
      </div>
      <dispatcherCall
          v-for="call in callsStore.calls"
          :key="call.id"
          :call="call"
      />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import dispatcherCall from '../components/dispatcherCall.vue'
import { useCallsStore } from '../stores/calls.js'

const callsStore = useCallsStore()
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
  min-height: 100vh;
}
.calls__header {
  display: flex;
  margin-left: 24px;
  margin-top: 24px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  min-width: 70vw;
  width: 100%;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.calls__header-title{
  font-weight: bold;
  font-size: x-large;

}
</style>
