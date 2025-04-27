<template>
  <div class="reports" @click="!$event.target.closest('.reports__filter-btn') && (showFilter = false)">
    <div class="reports__header">
      <button
          class="button reports__menu-btn"
          :class="{ 'list-view': isListView }"
          @click="toggleView"
      ></button>

      <input
          v-model="searchQuery"
          class="reports__search"
          type="text"
          placeholder="Поиск отчета..."
      />

      <div class="filter-wrapper">
        <button class="button reports__filter-btn" @click="showFilter = !showFilter"></button>

        <div v-if="showFilter" class="filter-dropdown">
          <div @click="sortReports('asc')">От А до Я</div>
          <div @click="sortReports('desc')">От Я до А</div>
        </div>
      </div>
    </div>

    <div :class="['reports__files', { 'list-view': isListView }]">
      <div
          v-for="report in filteredReports"
          :key="report.id"
          @click="$emit('openReport', report)"
          class="reports__file"
      >
        <img class="icon-file" src="/icons/file-text.svg" alt="file-text" />
        <span class="file_name">{{ report.endTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReportsStore } from '../stores/reports.js'

const reportsStore = useReportsStore()

const reports = computed(() =>
    reportsStore.reports.filter(report => report.status === 'complete')
)

const isListView = ref(false)
const showFilter = ref(false)
const searchQuery = ref('')
const sortOrder = ref(null)

const toggleView = () => {
  isListView.value = !isListView.value
}

const sortReports = (order) => {
  sortOrder.value = order
  showFilter.value = false
}

const filteredReports = computed(() => {
  const filtered = reports.value.filter(report =>
      report.modifiedAt.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (sortOrder.value === 'asc') {
    return [...filtered].sort((a, b) => a.modifiedAt.localeCompare(b.modifiedAt))
  } else if (sortOrder.value === 'desc') {
    return [...filtered].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  }

  return filtered
})
</script>

<style scoped>
.reports {
  box-sizing: border-box;
  margin: 24px;
  min-width: 70vw;
  width: 100%;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.reports__header {
  display: flex;
  gap: 10px;
  padding: 0 20px 10px;
  margin: 0 -24px;
  border-bottom: #ced0e9 5px solid;
}

.button {
  width: 40px;
  height: 40px;
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.reports__menu-btn {
  background-image: url("/icons/list.svg");
  background-size: 35px;
}

.reports__menu-btn.list-view {
  background-image: url("/icons/grid.svg");
  background-size: 35px;
}

.reports__filter-btn {
  background-image: url("/icons/filter.svg");
  background-size: 30px;
}

.button:hover {
  background-color: #a7a3cc;
}

.filter-wrapper {
  position: relative;
}

.filter-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  background: #a7a3cc;
  color: black;
  border-radius: 10px;
  z-index: 10;
  cursor: pointer;
  padding: 15px 15px;
  width: 80px;
}

.filter-dropdown div:hover {
  color: #fff;
}

.reports__search {
  flex: 1;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.reports__files {
  padding-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  overflow-y: auto;
  max-height: 78vh;
}

.reports__files.list-view {
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
  column-count: 2;
}

.reports__file {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 70px;
  font-size: 12px;
}

.reports__files.list-view .reports__file {
  flex-direction: row;
  align-items: center;
  max-width: 100%;
  padding: 5px 10px;
  gap: 10px;
}

.reports__file:hover {
  background-color: #a7a3cc;
  border-radius: 3px;
}

.icon-file {
  width: 70px;
  height: 70px;
}

.file_name {
  display: block;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding-bottom: 5px;
}

.reports__files.list-view .icon-file {
  width: 40px;
  height: 40px;
}

.reports__files.list-view .file_name {
  text-align: left;
}
</style>