<template>
    <div class="report">
        <button class="close-btn" @click="$emit('close')">✖</button>
        <h2 class="report__title">Отчет №{{ reportData.id }}</h2>

        <section class="report__block">
            <div><b>Бригадир:</b> {{ reportData.brigadier }}</div>
            <div><b>Оператор:</b> {{ reportData.operator }}</div>
            <div><b>Время вызова:</b> {{ reportData.callTime }}</div>
            <div><b>Вызов завершен:</b> {{ reportData.endTime }}</div>
        </section>

        <section class="report__block">
            <div><b>Адрес:</b> {{ reportData.fireAddress }}</div>
            <div><b>Категория:</b> {{ reportData.fireType }}</div>
            <div><b>Пострадавшие:</b> {{ reportData.victimsCount }}</div>

            <div>
                <b>Бригада и техника:</b>
                <ul>
                    <li>{{ reportData.auto }}</li>
                    <li>Что-то еще</li>
                </ul>
            </div>
        </section>

        <div class="report__form">
            <template v-if="reportData.status === 'complete'">
                <p class="report__data">
                    <b>Расход воды:</b> {{ reportData.waterSpent || 0 }} л
                </p>
                <p class="report__data">
                    <b>Расход пены:</b> {{ reportData.foamSpent || 0 }} л
                </p>
                <p class="report__data">
                    <b>Повреждения оборудования:</b>
                    {{
                        reportData.equipmentDamage ||
                        "оборудование не повреждено"
                    }}
                </p>
                <p class="report__data">
                    <b>Возможная причина пожара:</b>
                    {{ reportData.allegedFireCause || "—" }}
                </p>
                <p class="report__data">
                    <b>Оценка ущерба:</b> {{ reportData.damage || "—" }}
                </p>
                <p class="report__data">
                    <b>Дополнительная информация:</b>
                    {{ reportData.additionalNotes || "—" }}
                </p>
            </template>

            <template v-else>
                <label for="waterSpent">Расход воды:</label>
                <input
                    id="waterSpent"
                    name="waterSpent"
                    type="number"
                    min="0"
                    v-model="reportData.waterSpent"
                    :class="{ 'error-field': errors.waterSpent }"
                    @input="validateForm"
                />

                <label for="foamSpent">Расход пены:</label>
                <input
                    id="foamSpent"
                    name="foamSpent"
                    type="number"
                    min="0"
                    v-model="reportData.foamSpent"
                    :class="{ 'error-field': errors.foamSpent }"
                    @input="validateForm"
                />

                <label for="equipmentDamage">Повреждения оборудования:</label>
                <textarea
                    id="equipmentDamage"
                    name="equipmentDamage"
                    class="report_textarea"
                    v-model="reportData.equipmentDamage"
                    :disabled="isEquipmentDamageDisabled"
                />

                <label for="noDamage">
                    <input
                        id="noDamage"
                        name="noDamage"
                        type="checkbox"
                        v-model="reportData.noDamage"
                        :disabled="isNoDamageCheckboxDisabled"
                    />
                    оборудование не повреждено
                </label>

                <label for="allegedFireCause">Возможная причина пожара:</label>
                <textarea
                    id="allegedFireCause"
                    name="allegedFireCause"
                    class="report_textarea"
                    :class="{ 'error-field': errors.allegedFireCause }"
                    v-model="reportData.allegedFireCause"
                    @input="validateForm"
                />

                <label for="damageAssessment">Оценка ущерба:</label>
                <input
                    id="damageAssessment"
                    name="damageAssessment"
                    type="number"
                    min="0"
                    :class="{ 'error-field': errors.damage }"
                    v-model="reportData.damage"
                    @input="validateForm"
                />

                <label for="additionalNotes">Дополнительная информация:</label>
                <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    class="report_textarea"
                    :class="{ 'error-field': errors.additionalNotes }"
                    v-model="reportData.additionalNotes"
                    @input="validateForm"
                />
            </template>
        </div>

        <div class="buttons" v-if="reportData.status !== 'complete'">
            <button class="button button_primary" @click="saveDraft">
                Сохранить черновик
            </button>
            <button class="button button_secondary" @click="sendReport">
                Отправить отчет
            </button>
        </div>
    </div>
</template>

<script setup>
import query from "../common/query.js";
import { ref } from 'vue'
import { computed } from 'vue'

const props = defineProps({
    reportData: Object,
});

const errors = ref({
  waterSpent: false,
  foamSpent: false,
  allegedFireCause: false,
  damage: false,
  additionalNotes: false,
});

const reportData = props.reportData;
const isEquipmentDamageDisabled = computed(() => reportData.noDamage);
const isNoDamageCheckboxDisabled = computed(() => {
  return (reportData.equipmentDamage || '').length > 0;
});

const emit = defineEmits(["close"]);

async function saveDraft() {
    try {
        const report = props.reportData;
        const response = await query("incomplete_report", {
            reportId: report.id,
            waterSpent: report.waterSpent ?? 0,
            foamSpent: report.foamSpent ?? 0,
            allegedFireCause: report.allegedFireCause ?? "",
            damage: report.damage ?? 0,
            additionalNotes: report.additionalNotes ?? "",
        });
        
        if (response === null) return;
        
        props.reportData.status = "incomplete";
        emit("close");
    } catch (error) {
        console.error("Ошибка при сохранении черновика:", error);
    }
}

function validateForm() {
  let isValid = true;

  errors.value = {
    waterSpent: false,
    foamSpent: false,
    allegedFireCause: false,
    damage: false,
    additionalNotes: false,
  };

  const report = props.reportData;

  if (report.waterSpent.length === 0 || report.waterSpent < 0 || isNaN(report.waterSpent)) {
    errors.value.waterSpent = true;
    isValid = false;
  }

  if (report.foamSpent.length === 0 || report.foamSpent < 0) {
    errors.value.foamSpent = true;
    isValid = false;
  }

  if (report.allegedFireCause.length === 0) {
    errors.value.allegedFireCause = true;
    isValid = false;
  }

  if (report.damage.length === 0 || report.damage < 0) {
    errors.value.damage = true;
    isValid = false;
  }

  if (report.additionalNotes.length === 0) {
    errors.value.additionalNotes = true;
    isValid = false;
  }

  return isValid;
}

async function sendReport() {
    try {
        if (!validateForm()) {
          console.log('Есть ошибки в форме.');
          return;
        }

        const report = props.reportData;
        const response = await query("fill_report", {
            reportId: report.id,
            waterSpent: report.waterSpent ?? 0,
            foamSpent: report.foamSpent ?? 0,
            allegedFireCause: report.allegedFireCause ?? "",
            damage: report.damage ?? 0,
            additionalNotes: report.additionalNotes ?? "",
        });
        if (response === null) return;

        props.reportData.status = "complete";
        emit("close");
    } catch (error) {
        console.error("Ошибка при отправке отчета:", error);
    }
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

.report__data {
    margin: 0;
}

.error-field {
  border: 2px solid red;
  border-radius: 6px;
  background-color: #ffe6e6;
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
