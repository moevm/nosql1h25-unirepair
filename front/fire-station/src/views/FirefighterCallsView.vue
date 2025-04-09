<template>
  <div class="layout">
    <Sidebar class="sidebar"/>
    <EmptyCallsBlock class="block block_empty" v-if="callsStore.calls.length === 0" />
    <div class="block" v-else>
      <CallCard
          v-for="call in callsStore.calls"
          :key="call.id"
          :call="call"
      />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import EmptyCallsBlock from '../components/EmptyCallsBlock.vue'
import CallCard from '../components/CallCard.vue'
import { useCallsStore } from '../stores/calls.js'

const callsStore = useCallsStore()
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
  min-height: 100vh;
}
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
}

.block {
  margin-left: 20vw;
}
</style>
