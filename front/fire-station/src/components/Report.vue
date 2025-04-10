<template>
  <div class="report">
    <button class="close-btn" @click="$emit('close')">✖</button>
    <h2 class="report__title">Отчет №{{ reportData.number }}</h2>

    <section class="report__block">
      <div><b>Бригадир:</b> {{ reportData.brigadier }}</div>
      <div><b>Оператор:</b> {{ reportData.operator }}</div>
      <div><b>Время вызова:</b> {{ reportData.callTime }}</div>
      <div><b>Вызов завершен:</b> {{ reportData.endTime }}</div>
    </section>

    <section class="report__block">
      <div><b>Адрес:</b> {{ reportData.address }}</div>
      <div><b>Категория:</b> {{ reportData.category }}</div>
      <div><b>Пострадавшие:</b> {{ reportData.victims }}</div>

      <div>
        <b>Бригада и техника:</b>
        <ul>
          <li v-for="(item, index) in reportData.team" :key="index">{{ item }}</li>
        </ul>
      </div>
    </section>

    <div class="report__form">
      <label>Расход воды:</label>
      <input type="number" v-model="reportData.waterSpent" />

      <label>Расход пены:</label>
      <input type="number" v-model="reportData.foamSpent" />

      <label>Повреждения оборудования:</label>
      <textarea class="report_textarea" v-model="reportData.equipmentDamage" />

      <label>
        <input type="checkbox" v-model="reportData.noDamage" />
        оборудование не повреждено
      </label>

      <label>Возможная причина пожара:</label>
      <textarea class="report_textarea" v-model="reportData.fireReason" />

      <label>Оценка ущерба:</label>
      <textarea class="report_textarea" v-model="reportData.damageAssessment" />

      <label>Дополнительная информация:</label>
      <textarea class="report_textarea" v-model="reportData.additionalInfo" />
    </div>

    <div class="buttons">
      <button class="button button_primary" @click="saveDraft">Сохранить черновик</button>
      <button class="button button_secondary" @click="sendReport">Отправить отчет</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reportData: Object
})

function saveDraft() {
  console.log('Черновик сохранен', reportData.value)
}

function sendReport() {
  console.log('Отправка отчета', reportData.value)
}
</script>

<style scoped>
.report {
  position: relative;
  box-sizing: border-box;
  margin: 24px;
  min-width: 70vw;
  width: 100%;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.report__title {
  font-size: 20px;
  display: flex;
  gap: 10px;
  padding: 0 20px 10px;
  margin: 0 -24px 20px;
  border-bottom: #ced0e9 4px solid;
  justify-content: center;
}

.report__block {
  border-bottom: 1px solid #000000;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background-color: #fff;
  cursor: pointer;
  color: #900b09;
  font-size: 24px;
}

.report__form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.report_textarea {
  font-size: 16px;
  min-height: 60px;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 18px;
}

.button_primary {
  bottom: 20px;
  right: 20px;
  background-color: #b8b8b8;
}

.button_secondary {
  bottom: 20px;
  left: 20px;
  background-color: #a7a3cc;
}
</style>
