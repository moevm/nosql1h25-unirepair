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
                        <button @click="search(true)" id="submit-button">Найти</button>
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
                                    v-for="(report, index) in paginatedData"
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

                        <div class="pagination">
                        <button 
                            @click="prevPage" 
                            :disabled="!hasPrevPage || isLoading"
                            class="pagination-button"
                        >
                            Назад
                        </button>
                        
                        <div class="page-numbers">
                            <span v-if="currentPage > 3" class="page-dots">...</span>
                            <button
                            v-for="pageNum in visiblePages"
                            :key="pageNum"
                            @click="goToPage(pageNum)"
                            :class="{ 'current-page': pageNum === currentPage }"
                            :disabled="isLoading"
                            >
                            {{ pageNum }}
                            </button>
                            <span v-if="currentPage < totalPages - 2" class="page-dots">...</span>
                        </div>
                        
                        <button 
                            @click="nextPage" 
                            :disabled="!hasNextPage || isLoading"
                            class="pagination-button"
                        >
                            Вперед
                        </button>
                        
                        <select v-model="pageSize" @change="changePageSize" :disabled="isLoading">
                            <option value="5">5 на странице</option>
                            <option value="10">10 на странице</option>
                            <option value="20">20 на странице</option>
                            <option value="30">30 на странице</option>
                        </select>
                        
                        <span v-if="!isLoading">Всего записей: {{ totalItems }}</span>
                        <span v-else>Загрузка...</span>
                        </div>
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
            paginatedData: [],
            currentPage: 1,
            pageSize: 5,
            totalItems: 0,
            isLoading: false,
            forceDisablePrev: false
        };
    },
    computed: {
        totalPages() {
            return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        },
        hasNextPage() {
            return this.currentPage < this.totalPages && !this.isLoading;
        },
        hasPrevPage() {
            return this.currentPage > 1 && !this.isLoading && !this.forceDisablePrev;
        },
        visiblePages() {
            const pages = [];
            const total = this.totalPages;
            const current = this.currentPage;
            const maxVisible = 5;
            
            if (total <= maxVisible) {
                for (let i = 1; i <= total; i++) pages.push(i);
            } else {
                const start = Math.max(1, current - 2);
                const end = Math.min(total, current + 2);
                for (let i = start; i <= end; i++) pages.push(i);
            }
            return pages;
        }
    },
    methods: {
        async search(resetPage = false) {
            if (resetPage) {
                this.currentPage = 1;
            }

            this.isLoading = true;
            try {
                const response = await query("report_search", {
                    status: this.useStatus ? this.status : "",
                    waterSpent: range(this.waterSpent),
                    foamSpent: range(this.foamSpent),
                    allegedFireCause: this.allegedFireCause,
                    damage: range(this.damage),
                    additionalNotes: this.additionalNotes,
                    modifiedAt: range(this.modifiedAt),
                    page: this.currentPage.toString(),
                    pageSize: this.pageSize.toString()
                });

                if (!response) {
                    this.foundReports = [];
                    this.totalItems = 0;
                    this.paginatedData = [];
                    return;
                }

                this.foundReports = response.data || response;
                this.totalItems = response.total || response.length || 0;
                this.paginatedData = this.foundReports;

            } catch (error) {
                console.error("Ошибка поиска:", error);
                this.foundReports = [];
                this.totalItems = 0;
                this.paginatedData = [];
                this.forceDisablePrev = true;
            } finally {
                this.isLoading = false;
            }
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
        updatePaginatedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            this.paginatedData = this.foundReports.slice(start, end);
        },
        async nextPage() {
            if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.search();
            }
        },
        async prevPage() {
            if (this.currentPage > 1) {
            this.currentPage--;
            await this.search();
            }
        },
        async goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.search();
            }
        },
        async changePageSize() {
            this.currentPage = 1;
            await this.search();
        }
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
  margin-bottom: 20px;
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

tr {
  height: var(--row-height);
}

td, th {
  border: 1px solid black;
  text-align: center;
  font-size: small;
  word-wrap: break-word;
  white-space: normal;
  padding: 8px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 15px 0;
  border-top: 1px solid #ddd;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 8px 16px;
  font-size: large;
  border-radius: 10px;
  border: none;
  background-color: #a7a3cc;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #766ebf;
}

.pagination-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #a7a3cc;
  background-color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-number:hover {
  background-color: #e0ddf5;
}

.current-page {
  background-color: #a7a3cc;
  color: white;
  font-weight: bold;
}

.page-dots {
  padding: 0 5px;
}

select {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #a7a3cc;
  background-color: white;
  font-size: large;
}
</style>
