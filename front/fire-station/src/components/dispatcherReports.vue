<template>
  <div class="reports__container">
  <div class="reports">
    <div class="reports__header">
      <span class="reports__header-title">Отчеты оператора</span>
    </div>

    <div class="reports__files">
      <div
          v-for="report in reports"
          @click="$emit('openReport', report)"
          class="reports__file"
      >
        <img class="icon-file" src="/icons/file-text.svg" alt="file-text" />
        <span class="file_name">{{ report.name }}</span>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const reports = ref([
  {
    id: 2,
    name: 'Rep_22.02.24_08:51_5-2',
    number: '15.12.24_02:36_6-2',
    brigadier: 'Иванов И. И.',
    operator: 'Петров П. П.',
    callTime: '02:36 15.12.24',
    endTime: '04:10 15.12.24',
    address: 'Ул. Ленина, д. 12, 3-й этаж',
    category: 'Квартира (многоквартирный дом)',
    victims: '1 человек (эвакуирован)',
    team: [
      'Бригада 1 (5 человек)',
      'Автомобиль Л-41',
      'Лестница 10 м',
      'Генератор пены'
    ],
    waterSpent: '',
    foamSpent: '',
    equipmentDamage: '',
    noDamage: false,
    fireReason: '',
    damageAssessment: '',
    additionalInfo: ''
  },
])

</script>

<style scoped>
.reports__container {
  padding: 20px;
  margin: 0;
  background-color: #CED0E9;
  width: 100vw;
}
.reports {
  box-sizing: border-box;
  min-width: 70vw;
  width: 100%;
  background: #fff;
  padding: 24px;
  height: 95vh;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.reports__header {
  display: flex;
  gap: 10px;
  padding: 0 20px 10px;
  margin: 0 -24px;
  border-bottom: #ced0e9 5px solid;
  justify-content: center;
  align-items: center;
}

.reports__header-title{
  font-weight: bold;
  font-size: x-large;

}

.reports__files {
  padding-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  overflow-y: auto;
  max-height: 78vh;
}

.reports__file {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 70px;
  font-size: 12px;
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

</style>