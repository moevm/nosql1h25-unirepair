<template>
    <div class="layout">
        <Sidebar />
        <div class="block">
            <div class="content__container">
                <div class="table__label">
                    <RouterLink id="exit-icon" to="/db">
                        <img src="/icons/exit.svg" />
                    </RouterLink>
                    <label style="font-size: xx-large">Отчёты</label>
                </div>
                <div class="table-field__container">
                    <div>
                        <div>
                            <input
                                type="checkbox"
                                v-model="useStatus"
                                style="margin-right: 10px; transform: scale(1.5)"
                            />
                            <span>Статус:</span>
                            <input
                                type="radio"
                                v-model="status"
                                value="Complete"
                                class="text__input"
                                :disabled="!useStatus"
                            /><span>Завершен</span>
                            <input
                                type="radio"
                                v-model="status"
                                value="Incomplete"
                                class="text__input"
                                :disabled="!useStatus"
                            /><span>Не завершен</span>
                            <input
                                type="radio"
                                v-model="status"
                                value="New"
                                class="text__input"
                                :disabled="!useStatus"
                            /><span>Новый</span>
                        </div>

                        <span>Расход воды: </span>
                        <span>от:</span>
                        <input
                            type="number"
                            min="0"
                            v-model="waterSpent.from"
                            @blur="
                                waterSpent.from < 0 && waterSpent.from !== ''
                                    ? (waterSpent.from = 0)
                                    : true
                            "
                            style="width: 50px"
                            class="text__input"
                        />
                        <span>до:</span>
                        <input
                            type="number"
                            min="0"
                            v-model="waterSpent.to"
                            @blur="
                                waterSpent.to < 0 && waterSpent.to !== ''
                                    ? (waterSpent.to = 0)
                                    : true
                            "
                            style="width: 50px"
                            class="text__input"
                        />
                        <span>Расход пены: </span>
                        <span>от:</span>
                        <input
                            type="number"
                            min="0"
                            v-model="foamSpent.from"
                            @blur="
                                foamSpent.from < 0 && foamSpent.from !== ''
                                    ? (foamSpent.from = 0)
                                    : true
                            "
                            style="width: 50px"
                            class="text__input"
                        />
                        <span>до:</span>
                        <input
                            type="number"
                            min="0"
                            v-model="foamSpent.to"
                            @blur="
                                foamSpent.to < 0 && foamSpent.to !== ''
                                    ? (foamSpent.to = 0)
                                    : true
                            "
                            style="width: 50px"
                            class="text__input"
                        />
                        <span>Предполагаемая причина пожара:</span>
                        <input
                            type="text"
                            v-model="allegedFireCause"
                            class="text__input"
                        />
                        <br />
                        <span>Оценка ущерба: </span>
                        <span>от:</span>
                        <input
                            type="number"
                            min="0"
                            v-model="damage.from"
                            @blur="
                                damage.from < 0 && damage.from !== ''
                                    ? (damage.from = 0)
                                    : true
                            "
                            style="width: 50px"
                            class="text__input"
                        />
                        <span>до:</span>
                        <input
                            type="number"
                            min="0"
                            v-model="damage.to"
                            @blur="
                                damage.to < 0 && damage.to !== ''
                                    ? (damage.to = 0)
                                    : true
                            "
                            style="width: 50px"
                            class="text__input"
                        />
                        <span>Дополнительная информация:</span>
                        <input
                            type="text"
                            v-model="additionalNotes"
                            class="text__input"
                        />
                        <br />
                        <span>Время сохранения: </span>
                        <span>от:</span>
                        <input
                            type="date"
                            v-model="modifiedAt.from"
                            class="text__input"
                            style="padding: 5px"
                        />
                        <span>до:</span>
                        <input
                            type="date"
                            v-model="modifiedAt.to"
                            class="text__input"
                            style="padding: 5px"
                        />
                        <button @click="search" id="submit-button">Найти</button>
                        <button
                            @click="reset"
                            id="submit-button"
                            style="margin-left: 10px"
                        >
                            Сбросить
                        </button>
                    </div>
                    <ChartBuilder
                        :data="foundReports"
                        :xOptions="[
                          { value: 'status', label: 'Статус' },
                          { value: 'allegedFireCause', label: 'Причина пожара' },
                          { value: 'modifiedAt', label: 'Дата' }
                      ]"
                        :yOptions="[
                          { value: 'count', label: 'Количество записей' },
                          { value: 'waterSpent', label: 'Расход воды' },
                          { value: 'foamSpent', label: 'Расход пены' },
                          { value: 'damage', label: 'Ущерб' },
                      ]"
                        :labels="statusTranslations"
                        :getStatus="findStatus"
                    />
                    <div class="table__container">
                        <table>
                            <thead
                                style="
                                    position: sticky;
                                    top: 0;
                                    background-color: white;
                                    border: 1px solid black;
                                "
                            >
                                <tr>
                                    <th style="width: 10%">Статус</th>
                                    <th style="width: 5%">Расход воды</th>
                                    <th style="width: 5%">Расход пены</th>
                                    <th style="width: 20%">
                                        Предполагаемая причина пожара
                                    </th>
                                    <th>Оценка ущерба</th>
                                    <th style="width: 30%">
                                        Дополнительная информация
                                    </th>
                                    <th>Время сохранения</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(report, index) in foundReports"
                                    :key="index"
                                >
                                    <td style="width: 10%">
                                        {{ statusTranslations[findStatus(report)] }}
                                    </td>
                                    <td style="width: 5%">
                                        {{ report.waterSpent }}
                                    </td>
                                    <td style="width: 5%">
                                        {{ report.foamSpent }}
                                    </td>
                                    <td style="width: 20%">
                                        {{ report.allegedFireCause }}
                                    </td>
                                    <td>{{ report.damage }}</td>
                                    <td>{{ report.additionalNotes }}</td>
                                    <td>{{ report.modifiedAt }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import query from "../../common/query.js";
import range from "../../common/range.js";
import ChartBuilder from "@/components/ChartBuilder.vue";

export default {
    name: "ReportsView",
    components: {ChartBuilder, Sidebar },
    data() {
        return {
            status: "Complete",
            waterSpent: { from: "", to: "" },
            foamSpent: { from: "", to: "" },
            allegedFireCause: "",
            damage: { from: "", to: "" },
            additionalNotes: "",
            modifiedAt: { from: "", to: "" },

            useStatus: false,
            foundReports: [],
            statusTranslations: {
                Complete: "Завершен",
                Incomplete: "Не завершен",
                New: "Новый",
            },
        };
    },
    methods: {
        async search() {
            const data = await query("report_search", {
                status: this.useStatus ? this.status : "",
                waterSpent: range(this.waterSpent),
                foamSpent: range(this.foamSpent),
                allegedFireCause: this.allegedFireCause,
                damage: range(this.damage),
                additionalNotes: this.additionalNotes,
                modifiedAt: range(this.modifiedAt),
            });
            if (data === null) return;
            this.foundReports = data;
        },
        findStatus(user) {
            return user.labels.find(
                (label) =>
                    label === "Complete" ||
                    label === "Incomplete" ||
                    label === "New",
            );
        },
        reset() {
            this.status = "Complete";
            this.waterSpent = { from: "", to: "" };
            this.foamSpent = { from: "", to: "" };
            this.allegedFireCause = "";
            this.damage = { from: "", to: "" };
            this.additionalNotes = "";
            this.modifiedAt = { from: "", to: "" };

            this.useStatus = false;
        },
    },
};
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #ced0e9;
}

.block {
  display: flex;
  height: 100vh;
  overflow-y: auto;
  position: relative;
}

#submit-button {
  cursor: pointer;
  font-size: large;
  border-radius: 10px;
  border: none;
  padding: 7px 12px;
  background-color: #a7a3cc;
}

#submit-button:hover {
  background-color: #766ebf;
}

.content__container {
  margin: 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100vw;
}

.table__label {
  text-align: center;
  border-radius: 20px 20px 0 0;
  padding: 10px;
  background-color: white;
  position: relative;
}

#exit-icon {
  position: absolute;
  cursor: pointer;
  padding: 10px;
  right: 5px;
  top: 5px;
  height: auto;
}

#exit-icon:hover {
  background-color: rgb(128, 128, 128, 0.2);
  border-radius: 10px;
}

.table-field__container {
  border-radius: 0 0 20px 20px;
  background-color: white;
  padding-left: 4vw;
  padding-top: 2vw;
  padding-bottom: 2vh;
  flex: 1;
}

.text__input {
  font-size: large;
  margin: 0 10px 10px 10px;
}

span {
  font-size: large;
}

.table__container {
  --row-height: 80px;

  overflow-y: scroll;
  width: 96%;
  max-height: calc(
    7 * (var(--row-height))
  );
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

tr {
  height: var(--row-height);
}

td,
th {
  border: 1px solid black;
  text-align: center;
  font-size: small;
  word-wrap: break-word;
  white-space: normal;
}
</style>
