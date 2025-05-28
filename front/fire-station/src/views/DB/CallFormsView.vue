<template>
  <div class="layout">
    <Sidebar />
    <div class="block">
      <div class="content__container">
        <div class="table__label">
          <RouterLink id="exit-icon" to="/db">
            <img src="/icons/exit.svg" />
          </RouterLink> 
          <label style="font-size: xx-large">Формы вызова</label>
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
            </div>
            <span>Дата создания: </span>
            <span>от:</span>
            <input
              type="date"
              v-model="created.from"
              class="text__input"
              style="padding: 5px"
            />
            <span>до:</span>
            <input
              type="date"
              v-model="created.to"
              class="text__input"
              style="padding: 5px"
            />
            <span>Дата последнего обновления: </span>
            <span>от:</span>
            <input
              type="date"
              v-model="lastUpdate.from"
              class="text__input"
              style="padding: 5px"
            />
            <span>до:</span>
            <input
              type="date"
              v-model="lastUpdate.to"
              class="text__input"
              style="padding: 5px"
            />
            <br />
            <span>Источник вызова:</span>
            <input type="text" v-model="callSource" class="text__input" />
            <span>Характер пожара:</span>
            <input type="text" v-model="fireDescription" class="text__input" />
            <div>
              <input
                type="checkbox"
                v-model="useRank"
                style="margin-right: 10px; transform: scale(1.5)"
              />
              <span>Ранг пожара:</span>
              <input
                type="radio"
                v-model="fireRank"
                value="1"
                class="text__input"
                :disabled="!useRank"
              /><span>1</span>
              <input
                type="radio"
                v-model="fireRank"
                value="1-BIS"
                class="text__input"
                :disabled="!useRank"
              /><span>1-БИС</span>
              <input
                type="radio"
                v-model="fireRank"
                value="2"
                class="text__input"
                :disabled="!useRank"
              /><span>2</span>
              <input
                type="radio"
                v-model="fireRank"
                value="3"
                class="text__input"
                :disabled="!useRank"
              /><span>3</span>
              <input
                type="radio"
                v-model="fireRank"
                value="4"
                class="text__input"
                :disabled="!useRank"
              /><span>4</span>
              <span style="margin-left: 20px">Адрес:</span>
              <input type="text" v-model="fireAddress" class="text__input" />
            </div>
            <span>Количество жертв: </span>
            <span>от:</span>
            <input
              type="number"
              v-model="victims.from"
              class="text__input"
              style="width: 50px"
              min="0"
              @blur="
                victims.from < 0 && victims.from !== ''
                  ? (victims.from = 0)
                  : true
              "
            />
            <span>до:</span>
            <input
              type="number"
              v-model="victims.to"
              class="text__input"
              style="width: 50px"
              min="0"
              @blur="
                victims.to < 0 && victims.to !== '' ? (victims.to = 0) : true
              "
            />
            <span>Прикрепленная бригада:</span>
            <input
              type="number"
              min="1"
              v-model="brigade"
              @blur="brigade < 1 && brigade !== '' ? (brigade = 1) : true"
              style="width: 50px"
              class="text__input"
            />
            <button @click="search(true)" id="submit-button">Найти</button>
            <button @click="reset" id="submit-button" style="margin-left: 10px">
              Сбросить
            </button>
          </div>
          <ChartBuilder
              :data="foundCallForms"
              :xOptions="[
                          { value: 'status', label: 'Статус' },
                          { value: 'callSource', label: 'Источник вызова' },
                          { value: 'modifiedAt', label: 'Дата последнего изменения' },
                          { value: 'createdAt', label: 'Дата создания' },
                          { value: 'fireType', label: 'Тип пожара' },
                          { value: 'fireRank', label: 'Ранг пожара' },
                          { value: 'assignedTo', label: 'Номер бригады' }
                      ]"
              :yOptions="[
                          { value: 'count', label: 'Количество записей' },
                          { value: 'victimsCount', label: 'Количество жертв' },
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
                  <th style="width: 8%">Статус</th>
                  <th style="width: 8%">Время создания</th>
                  <th style="width: 8%">Последнее обновление</th>
                  <th style="width: 15%">Источник вызова</th>
                  <th style="width: 20%">Адрес</th>
                  <th style="width: 10%">Локализация пожара</th>
                  <th style="width: 10%">Характер пожара</th>
                  <th >Ранг пожара</th>
                  <th >Пострадавшие</th>
                  <th >Прикреплённая бригада</th>
                  <th style="width: 10%">Автомобиль</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(callForm, index) in foundCallForms" :key="index">
                  <td>
                    {{ statusTranslations[findStatus(callForm)] }}
                  </td>
                  <td>
                    {{ callForm.createdAt }}
                  </td>
                  <td>
                    {{ callForm.modifiedAt }}
                  </td>
                  <td>
                    {{ callForm.callSource }}
                  </td>
                  <td>
                    {{ callForm.fireAddress }}
                  </td>
                  <td>
                    {{
                      `(${callForm.bottomLeft.x};${callForm.bottomLeft.y}) (${callForm.topRight.x};${callForm.topRight.y})`
                    }}
                  </td>
                  <td>
                    {{ callForm.fireType }}
                  </td>
                  <td>
                    {{ callForm.fireRank }}
                  </td>
                  <td>
                    {{ callForm.victimsCount }}
                  </td>
                  <td>
                    {{ callForm.assignedTo }}
                  </td>
                  <td>
                    {{ callForm.auto ? callForm.auto : "-" }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="pagination">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="pagination-button"
              >
                Назад
              </button>
              
              <div class="page-numbers">
                <span 
                  v-if="currentPage > 3" 
                  class="page-dots"
                >...</span>
                
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="{ 'current-page': page === currentPage }"
                  class="page-number"
                >
                  {{ page }}
                </button>
                
                <span 
                  v-if="currentPage < totalPages - 2" 
                  class="page-dots"
                >...</span>
              </div>
              
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages || totalPages === 0"
                class="pagination-button"
              >
                Вперед
              </button>
              <select v-model="pageSize" @change="changePageSize">
                <option value="5">5 на странице</option>
                <option value="10">10 на странице</option>
                <option value="20">20 на странице</option>
                <option value="30">30 на странице</option>
              </select>
              <span>Всего записей: {{ totalItems }}</span>
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
import subscribe from "../../common/subscription.js";
import ChartBuilder from "@/components/ChartBuilder.vue";

export default {
  name: "DBCallForms",
  components: {ChartBuilder, Sidebar },
  data() {
    return {
      status: "Complete",
      created: { from: "", to: "" },
      lastUpdate: { from: "", to: "" },
      callSource: "",
      fireAddress: "",
      fireDescription: "",
      fireRank: "1",
      victims: { from: "", to: "" },
      brigade: "",

      useStatus: false,
      useRank: false,
      foundCallForms: [],
      statusTranslations: {
        Complete: "Завершен",
        Incomplete: "Не завершен",
      },
      currentPage: 1,
      pageSize: 5,
      totalItems: 0
    };
  },
  computed: {
     visiblePages() {
        const pages = [];
        const total = this.totalPages;
        const current = this.currentPage;
        const maxVisible = 5;
        
        if (total <= maxVisible) {
          for (let i = 1; i <= total; i++) {
            pages.push(i);
          }
        } else {
          const start = Math.max(1, current - 2);
          const end = Math.min(total, current + 2);
          
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }
        }
        
        return pages;
      },

    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    }
  },
  methods: {
    async search(resetPage = false) {
      if (resetPage) {
        this.currentPage = 1;
      }

      try {
      
      const response = await query("callform_search", {
        status: this.useStatus ? this.status : "",
        createdAt: range(this.created),
        modifiedAt: range(this.lastUpdate),
        callSource: this.callSource,
        fireAddress: this.fireAddress,
        fireType: this.fireDescription,
        fireRank: this.useRank ? this.fireRank : "",
        victimsCount: range(this.victims),
        assignedTo: this.brigade,
        page: this.currentPage.toString(),
        pageSize: this.pageSize.toString()
      });

      this.foundCallForms = response.data || [];
      this.totalItems = response.total || 0;

      console.log("Данные для отображения:", {
        page: this.currentPage,
        items: this.foundCallForms.length,
        total: this.totalItems
      });

      } catch (error) {
        console.error("Ошибка поиска:", error);
        this.foundCallForms = [];
        this.totalItems = 0;
      }

    },

    async nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        await this.search();
      }
    },

    async goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.search();
      }
    },
    
    async prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        await this.search();
      }
    },
    
    async changePageSize() {
      this.currentPage = 1;
      await this.search();
    },
  
    findStatus(user) {
      return user.labels.find(
        (label) => label === "Complete" || label === "Incomplete",
      );
    },
    reset() {
      this.status = "Complete";
      this.created = { from: "", to: "" };
      this.lastUpdate = { from: "", to: "" };
      this.callSource = "";
      this.fireDescription = "";
      this.fireRank = "1";
      this.victims = { from: "", to: "" };
      this.brigade = "";
      this.useRank = false;
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
  transition: background-color 0.3s;
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
  background-color: rgba(128, 128, 128, 0.2);
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
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

span {
  font-size: large;
}

.table__container {
  --row-height: 80px;
  overflow-y: scroll;
  width: 96%;
  max-height: calc(7 * var(--row-height));
  margin-top: 20px;
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
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

.pagination select {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #a7a3cc;
  background-color: white;
  font-size: large;
}

.pagination span {
  font-size: large;
  color: #555;
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

</style>