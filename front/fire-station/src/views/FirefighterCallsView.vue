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
import { onMounted } from 'vue'
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import EmptyCallsBlock from '../components/EmptyCallsBlock.vue'
import CallCard from '../components/CallCard.vue'
import { useCallsStore } from '../stores/calls.js'
import { useUserStore } from '../stores/user.js'

const callsStore = useCallsStore()
const userStore = useUserStore()

const stringifyURLParams = (paramsObj) => {
  return new URLSearchParams(
      Object.fromEntries(
          Object.entries(paramsObj).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
      )
  ).toString()
}

const fetchCalls = async () => {
  const brigadeNumber = userStore.user?.brigadeNumber;
  if (!brigadeNumber) {
    console.warn('Нет номера бригады пользователя для запроса вызовов')
    return
  }

  const params = stringifyURLParams({ assignedTo: brigadeNumber });

  try {
    const response = await axios.get(`http://localhost:3000/api/get_callforms?${params}`);
    const data = response.data;

    if (data?.message === 'No active calls') {
      callsStore.calls = [];
    } else {
      const transformedCalls = data.map((call) => ({
        fireAddress: call.fireAddress,
        bottomLeft: {
          latitude: call.bottomLeft.y,
          longitude: call.bottomLeft.x,
        },
        topRight: {
          latitude: call.topRight.y,
          longitude: call.topRight.x,
        },
        fireType: call.fireType,
        fireRank: call.fireRank,
        victimsCount: call.victimsCount,
        assignedTo: call.assignedTo ?? null,
        auto: call.auto ?? null,
      }));
      callsStore.setCalls(transformedCalls);
    }
  } catch (error) {
    console.error('Ошибка при получении вызовов:', error);
  }
}

onMounted(() => {
  fetchCalls()
})
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
