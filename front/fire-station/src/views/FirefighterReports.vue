<template>
    <div class="layout">
        <Sidebar class="sidebar" />
        <template v-if="showReport">
            <Report
                class="block"
                @close="showReport = false"
                :reportData="currentReport"
            />
        </template>

        <template v-else>
            <Reports class="block" @openReport="openReport" />
            <ButtonsForEdit
                v-if="userStore.user?.role === 'brigadier'"
                @openReport="openReport"
            />
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import Reports from "../components/Reports.vue";
import ButtonsForEdit from "../components/ButtonsForEdit.vue";
import Report from "../components/Report.vue";
import { useUserStore } from "../stores/user.js";
import { useReportsStore } from "../stores/reports.js";
import query from "../common/query.js";

const showReport = ref(false);
const currentReport = ref(null);

const openReport = (reportData) => {
    currentReport.value = reportData;
    showReport.value = true;
};

const userStore = useUserStore();
const reportsStore = useReportsStore();

onMounted(async () => {
    try {
        const brigadeNumber = userStore.user?.brigadeNumber;
        if (!brigadeNumber) return;

        const response = await query("brigade_reports", { brigadeNumber });
        if (response === null) return;
        const { complete_reports, incomplete_reports, new_reports } = response;

        const transformReports = (reportsArr, status) =>
            reportsArr.map(({ u, o, r, cf }) => ({
                brigadier: u
                    ? `${u.familyName} ${u.firstName} ${u.fatherName}`
                    : "",
                operator: `${o.familyName} ${o.firstName} ${o.fatherName}`,
                id: r.id,
                damage: r.damage,
                waterSpent: r.waterSpent,
                foamSpent: r.foamSpent,
                additionalNotes: r.additionalNotes,
                allegedFireCause: r.allegedFireCause,
                status,
                fireAddress: cf.fireAddress,
                fireType: cf.fireType,
                fireRank: cf.fireRank,
                victimsCount: cf.victimsCount,
                auto: cf.auto,
                modifiedAt: r.modifiedAt,
                assignedTo: cf.assignedTo,
                callId: cf.id,
            }));

        const allReports = [
            ...transformReports(complete_reports, "complete"),
            ...transformReports(incomplete_reports, "incomplete"),
            ...transformReports(new_reports, "new"),
        ];

        reportsStore.setReports(allReports);
        console.log(response.data);
        console.log(allReports);
    } catch (error) {
        console.error("Ошибка загрузки отчётов:", error);
    }
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
    margin-left: 22vw;
}
</style>
