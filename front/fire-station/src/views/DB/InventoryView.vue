<template>
    <div class="layout">
        <Sidebar />
        <div class="block">
            <div class="content__container">
                <div class="table__label">
                    <RouterLink id="exit-icon" to="/db">
                        <img src="/icons/exit.svg" />
                    </RouterLink>
                    <label style="font-size: xx-large">Инвентарь</label>
                </div>

                <div class="table-field__container">
                    <div>
                        <span>Добавить инвентарь:</span>
                        <input
                            type="text"
                            class="text__input"
                            v-model="newInventoryName"
                        />
                        <button @click="addInventory" id="submit-button">
                            Добавить
                        </button>
                        <br />

                        <span>Поиск инвентаря:</span>
                        <input
                            type="text"
                            class="text__input"
                            v-model="searchName"
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
                                    <th>Наименование инвентаря</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(inventory, index) in foundInventory"
                                    :key="index"
                                >
                                    <td>{{ inventory.name }}</td>
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

export default {
    name: "InventoryView",
    components: { Sidebar },
    data() {
        return {
            newInventoryName: "",
            searchName: "",
            foundInventory: [],
            paginatedData: [],
            currentPage: 1,
            pageSize: 5,
            totalItems: 0
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalItems / this.pageSize);
        },
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
        }
    },
    methods: {
        async search(resetPage = true) {
            if (resetPage) {
                this.currentPage = 1;
            }

            try {
                const response = await query("inventory_search", {
                    name: this.searchName,
                    page: this.currentPage,
                    pageSize: this.pageSize
                });

                this.foundInventory = response.data || [];
                this.totalItems = response.total || 0;
                
                console.log("Данные инвентаря:", {
                    page: this.currentPage,
                    items: this.foundInventory.length,
                    total: this.totalItems
                });

            } catch (error) {
                console.error("Ошибка поиска:", error);
                this.foundInventory = [];
                this.totalItems = 0;
            }
        },
        async addInventory() {
            const name = this.newInventoryName.trim();
            if (!name) {
                alert("Введите название инвентаря");
                return;
            }

            try {
                const response = await query("inventory_add", { name });
                if (response) {
                    this.newInventoryName = "";
                    this.search(true);
                }
            } catch (error) {
                console.error("Полная ошибка:", error);
                if (error.response) {
                    alert(error.response.data?.message || "Ошибка сервера");
                } else {
                    alert("Не удалось подключиться к серверу");
                }
            }
        },
        reset() {
            this.searchName = "";
            this.search(true);
        },
        updatePaginatedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            this.paginatedData = this.foundInventory.slice(start, end);
        },
        async nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                await this.search(false);
            }
        },
        async prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                await this.search(false);
            }
        },
        async goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                await this.search(false);
            }
        },
        async changePageSize() {
            this.currentPage = 1;
            await this.search(false);
        }
    },
    mounted() {
        this.search(true);
    }
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
  padding: 20px;
}

.text__input {
  font-size: large;
  margin: 0 10px 10px 10px;
}

span {
  font-size: large;
}

.table__container {
  --row-height: 50px;
  width: 100%;
  overflow-y: scroll;
  max-height: calc(7 * var(--row-height) + 40px);
  margin-bottom: 20px;
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
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