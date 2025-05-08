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
                        <!-- Поле для добавления нового инвентаря -->
                        <span>Добавить инвентарь:</span>
                        <input
                            type="text"
                            class="text__input"
                            v-model="newInventoryName"
                        />
                        <button @click="addInventory" class="submit-button">
                            Добавить
                        </button>
                        <br />

                        <!-- Поле для поиска существующего инвентаря -->
                        <span>Поиск инвентаря:</span>
                        <input
                            type="text"
                            class="text__input"
                            v-model="searchName"
                        />
                        <button @click="search" class="submit-button">Найти</button>
                        <button
                            @click="reset"
                            class="submit-button"
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
        };
    },
    methods: {
        async search() {
            const data = await query("inventory_search", {
                name: this.searchName,
            });
            if (data === null) return;
            this.foundInventory = data;
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
                    this.search();
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
            this.search();
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
  font-size: x-large;
  border-radius: 10px;
  border: none;
  padding: 10px 20px 10px 20px;
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
  --row-height: 50px;

  width: 20%;
  overflow-y: scroll;
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
