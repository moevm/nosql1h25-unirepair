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
import { onMounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import EmptyCallsBlock from "../components/EmptyCallsBlock.vue";
import CallCard from "../components/CallCard.vue";
import { useCallsStore } from "../stores/calls.js";
import { useUserStore } from "../stores/user.js";
import query from "../common/query.js";

const callsStore = useCallsStore();
const userStore = useUserStore();

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
    fetchCalls();
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
</style>
