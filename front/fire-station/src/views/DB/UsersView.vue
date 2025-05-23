<template>
  <div class="layout">
    <Sidebar />
    <div class="block">
      <div class="content__container">
        <div class="table__label">
          <RouterLink id="exit-icon" to="/db">
            <img src="/icons/exit.svg" />
          </RouterLink>
          <label style="font-size: xx-large">Сотрудники</label>
        </div>
        <div class="table-field__container">
          <div>
            <span>Фамилия:</span>
            <input type="text" v-model="surname" class="text__input" />
            <span>Имя:</span>
            <input type="text" v-model="name" class="text__input" />
            <span>Отчество:</span>
            <input type="text" v-model="patronymic" class="text__input" />
            <br />
            <div style="margin-bottom: 10px">
              <input
                type="checkbox"
                v-model="useRole"
                style="margin-right: 10px; transform: scale(1.5)"
              />
              <span>Должность:</span>
              <input
                type="radio"
                v-model="role"
                value="Fireman"
                :disabled="!useRole"
              /><span>Пожарный</span>
              <input
                type="radio"
                v-model="role"
                value="Operator"
                :disabled="!useRole"
              /><span>Оператор</span>
              <input
                type="radio"
                v-model="role"
                value="Admin"
                :disabled="!useRole"
              /><span>Администратор</span>
              <input
                type="radio"
                v-model="role"
                value="Brigadier"
                :disabled="!useRole"
              /><span>Бригадир</span>
            </div>
            <span>Бригада:</span>
            <input
              type="number"
              min="1"
              v-model="brigade"
              :disabled="role !== 'Fireman' && role !== 'Brigadier' && useRole"
              @blur="brigade < 1 && brigade !== '' ? (brigade = 1) : true"
              style="width: 50px"
              class="text__input"
            />
            <span>Адрес:</span>
            <input type="text" v-model="address" class="text__input" />
            <span>Логин:</span>
            <input type="text" v-model="login" class="text__input" />
            <br />
            <span>Дата регистрации: </span>
            <span>от:</span>
            <input
              type="date"
              v-model="registeredAt.from"
              class="text__input"
              style="padding: 5px"
            />
            <span>до:</span>
            <input
              type="date"
              v-model="registeredAt.to"
              class="text__input"
              style="padding: 5px"
            />
            <br />
            <span>Дата последнего изменения: </span>
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
            <button @click="reset" id="submit-button" style="margin-left: 10px">
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
                  <th style="width: 8%">ФИО</th>
                  <th style="width: 10%">Должность</th>
                  <th style="width: 5%">Бригада</th>
                  <th style="width: 10%">Адрес проживания</th>
                  <th style="width: 10%">Телефон</th>
                  <th style="width: 15%">E-mail</th>
                  <th style="width: 10%">Логин</th>
                  <th style="width: 10%">Хеш пароля</th>
                  <th style="width: 5%">Время регистрации</th>
                  <th style="width: 5%">Время последнего изменения</th>
                  <th style="width: 10%">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in paginatedData" :key="index">
                  <td style="width: 8%">
                    {{
                      user.firstName +
                      " " +
                      user.familyName +
                      " " +
                      user.fatherName
                    }}
                  </td>
                  <td style="width: 10%">
                    {{ rolesTranslations[findRole(user)] }}
                  </td>
                  <td style="width: 5%">
                    {{ user.brigadeNumber > 0 ? user.brigadeNumber : "-" }}
                  </td>
                  <td style="width: 10%">{{ user.address }}</td>
                  <td style="width: 10%">{{ user.phone }}</td>
                  <td style="width: 10%">{{ user.email }}</td>
                  <td style="width: 10%">{{ user.login }}</td>
                  <td style="word-break: break-all; width: 10%">
                    <div style="overflow-y: auto; max-height: var(--row-height)">
                      {{ user.password }}
                    </div>
                  </td>
                  <td style="width: 5%">
                    {{ user.registeredAt }}
                  </td>
                  <td style="width: 5%">
                    {{ user.modifiedAt }}
                  </td>
                  <td style="width: 10%">
                    {{ statusTranslations[findStatus(user)] }}
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
              <span>Всего записей: {{ foundUsers.length }}</span>
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

export default {
  name: "DBUsers",
  components: { Sidebar },
  data() {
    return {
      name: "",
      surname: "",
      patronymic: "",
      role: "Fireman",
      brigade: "",
      address: "",
      phone: "",
      email: "",
      login: "",
      password: "",
      registeredAt: { from: "", to: "" },
      modifiedAt: { from: "", to: "" },
      status: "",

      useRole: false,
      foundUsers: [],
      paginatedData: [],
      currentPage: 1,
      pageSize: 5,
      rolesTranslations: {
        Brigadier: "Бригадир",
        Fireman: "Пожарный",
        Operator: "Оператор",
        Admin: "Администратор",
      },
      statusTranslations: {
        Active: "Активный",
        Deleted: "Удален",
      },
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.foundUsers.length / this.pageSize);
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
    async search() {
      const data = await query("user_search", {
        familyName: this.surname,
        firstName: this.name,
        fatherName: this.patronymic,
        role: this.useRole ? this.role : "",
        brigadeNumber:
          !this.useRole ||
          (this.useRole &&
            (this.role === "Fireman" || this.role === "Brigadier"))
            ? this.brigade
            : "",
        phone: this.phone,
        address: this.address,
        login: this.login,
        status: this.status,
        registeredAt: range(this.registeredAt),
        modifiedAt: range(this.modifiedAt),
      });
      if (data === null) return;
      this.foundUsers = data;
      this.currentPage = 1;
      this.updatePaginatedData();
    },
    findRole(user) {
      return user.labels.find(
        (label) =>
          label === "Brigadier" ||
          label === "Fireman" ||
          label === "Operator" ||
          label === "Admin",
      );
    },
    findStatus(user) {
      return user.labels.find(
        (label) => label === "Active" || label === "Deleted",
      );
    },
    reset() {
      this.name = "";
      this.surname = "";
      this.patronymic = "";
      this.role = "Fireman";
      this.brigade = "";
      this.address = "";
      this.phone = "";
      this.email = "";
      this.login = "";
      this.registeredAt = { from: "", to: "" };
      this.modifiedAt = { from: "", to: "" };
      this.status = "";
    },
    updatePaginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedData = this.foundUsers.slice(start, end);
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updatePaginatedData();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePaginatedData();
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.updatePaginatedData();
      }
    },
    changePageSize() {
      this.currentPage = 1;
      this.updatePaginatedData();
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
  --row-height: 80px;
  overflow-y: scroll;
  width: 96%;
  max-height: calc(7 * var(--row-height));
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