<template>
    <div class="buttons">
        <button
            class="button button__reports-btn"
            @click="
                showNewReports = !showNewReports;
                showEditReports = false;
            "
        ></button>

        <div
            v-if="showNewReports && new_reports.length"
            class="reports-dropdown"
        >
            <div
                v-for="report in new_reports"
                :key="report.id"
                @click="$emit('openReport', report)"
            >
                {{ report.modifiedAt }}
            </div>
        </div>

        <button
            class="button button__edit-reports-btn"
            @click="
                showEditReports = !showEditReports;
                showNewReports = false;
            "
        ></button>

        <div
            v-if="showEditReports && incomplete_reports.length"
            class="edit-reports-dropdown"
        >
            <div
                v-for="report in incomplete_reports"
                :key="report.id"
                @click="$emit('openReport', report)"
            >
                {{ report.modifiedAt }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useReportsStore } from "../stores/reports.js";

const reportsStore = useReportsStore();

const new_reports = computed(() =>
    reportsStore.reports.filter((report) => report.status === "new"),
);

const incomplete_reports = computed(() =>
    reportsStore.reports.filter((report) => report.status === "incomplete"),
);

const showNewReports = ref(false);
const showEditReports = ref(false);
</script>

<style scoped>
.button {
    position: absolute;
    width: 60px;
    height: 60px;
    background-color: #a7a3cc;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
    border-radius: 50%;
    cursor: pointer;
}

.button__reports-btn {
    bottom: 50px;
    right: 50px;
    background-image: url("/icons/addFile.svg");
    background-size: 45px;
}

.button__edit-reports-btn {
    bottom: 50px;
    right: 130px;
    background-image: url("/icons/edit-2.svg");
    background-size: 45px;
}

.reports-dropdown,
.edit-reports-dropdown {
    position: absolute;
    bottom: 120px;
    right: 50px;
    background: #a7a3cc;
    color: black;
    border-radius: 10px;
    z-index: 10;
    cursor: pointer;
    padding: 15px 15px;
}

.edit-reports-dropdown {
    right: 130px;
}

.reports-dropdown div:hover {
    color: #fff;
}
</style>
