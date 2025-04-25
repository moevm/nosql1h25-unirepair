<template>
  <div class="layout">
    <Sidebar class="sidebar"/>
    <template v-if="showReport">
      <Report class="block" @close="showReport = false" :reportData="currentReport" />
    </template>

    <template v-else>
      <Reports class="block" @openReport="openReport"/>
      <ButtonsForEdit v-if="userStore.user?.role === 'brigadier'" @openReport="openReport"/>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from "../components/Sidebar.vue"
import Reports from "../components/Reports.vue"
import ButtonsForEdit from "../components/ButtonsForEdit.vue"
import Report from "../components/Report.vue"
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
import { useReportsStore } from '../stores/reports.js'

const showReport = ref(false)
const currentReport = ref(null)

const openReport = (reportData) => {
  currentReport.value = reportData
  showReport.value = true
}

const stringifyURLParams = (params) =>
    Object.entries(params)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join('&')

const userStore = useUserStore()
const reportsStore = useReportsStore()

onMounted(async () => {
  try {
    const brigadeNumber = userStore.user?.brigadeNumber
    if (!brigadeNumber) return

    const query = stringifyURLParams({ brigadeNumber })
    const response = await axios.get(`http://localhost:3000/api/brigade_reports?${query}`)

    const { complete_reports, incomplete_reports, new_reports } = response.data

    const normalizeDate = (dt) => {
      if (!dt?.year) return null
      const y = dt.year
      const m = String(dt.month).padStart(2, '0')
      const d = String(dt.day).padStart(2, '0')
      const h = String(dt.hour).padStart(2, '0')
      const min = String(dt.minute).padStart(2, '0')
      const s = String(dt.second).padStart(2, '0')
      return `${y}-${m}-${d}T${h}:${min}:${s}Z`
    }

    const transformReports = (reportsArr, status) =>
        reportsArr.map(({ u, o, r, cf }) => ({
          brigadier: `${u.familyName} ${u.firstName} ${u.fatherName}`,
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
          modifiedAt: normalizeDate(r.modifiedAt),
          assignedTo: cf.assignedTo,
          callId: cf.id,
        }))

    const allReports = [
      ...transformReports(complete_reports, 'complete'),
      ...transformReports(incomplete_reports, 'incomplete'),
      ...transformReports(new_reports, 'new'),
    ]

    reportsStore.setReports(allReports)
    console.log(response.data)
    console.log(allReports)
  } catch (error) {
    console.error('Ошибка загрузки отчётов:', error)
  }
})
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