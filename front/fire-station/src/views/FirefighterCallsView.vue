<template>
    <div class="layout">
        <Sidebar class="sidebar" />
        <EmptyCallsBlock
            class="block block_empty"
            v-if="callsStore.calls.length === 0"
        />
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
import {onMounted, onUnmounted, ref} from "vue";
import Sidebar from "../components/Sidebar.vue";
import EmptyCallsBlock from "../components/EmptyCallsBlock.vue";
import CallCard from "../components/CallCard.vue";
import { useCallsStore } from "../stores/calls.js";
import { useUserStore } from "../stores/user.js";
import query from "../common/query.js";

const callsStore = useCallsStore();
const userStore = useUserStore();
const intervalId = ref(null);

const getStatusFromLabels = (labels) => {
    const status = ["Incomplete", "Complete"];
    return labels.find((label) => status.includes(label)) || "unknown";
};

const fetchCalls = async () => {
    const brigadeNumber = userStore.user?.brigadeNumber;
    if (!brigadeNumber) {
        console.warn("Нет номера бригады пользователя для запроса вызовов");
        return;
    }

    try {
        const data = await query("get_callforms", {
            assignedTo: brigadeNumber,
        });
        if (data === null) return;

        if (data?.length === 0) {
            callsStore.calls = [];
        } else {
            const transformedCalls = data.map((call) => ({
                status: getStatusFromLabels(call.labels),
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
                modifiedAt: call.modifiedAt ?? null,
                id: call.id ?? null,
            }));
            callsStore.setCalls(
                transformedCalls.filter(
                    (report) => report.status === "Incomplete",
                ),
            );
        }
    } catch (error) {
        console.error("Ошибка при получении вызовов:", error);
    }
};

onMounted(() => {
  fetchCalls(); // первый вызов

  intervalId.value = setInterval(() => {
    fetchCalls();
  }, 7000); // каждые 15 секунд
});

onUnmounted(() => {
  clearInterval(intervalId.value);
});
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
    margin-left: 20vw;
}

@media (max-width: 768px) {
  .layout {
    min-height: 200px;
    display: flex;
    background-color: #CED0E9;
    justify-content: center;
    margin: 0;
    padding: 0;

  }
  .sidebar{
    position: fixed;
    top: auto;
    left: 0;
    bottom: 0;
    width: 100%;
    max-height: 80px;
    z-index: 100000;
    height: 12vh;
    min-height: 55px;
  }
  .block{

    margin-top: 12px;
    margin-bottom: 12px;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    height: 88vh;
    overflow: auto;

  }
}
</style>
