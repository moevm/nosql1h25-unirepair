<template>
    <div class="searchUser__container">
        <div class="component-label__container">
            <img
                id="exit-icon"
                src="/icons/exit.svg"
                @click="$emit('component-change', 'menu')"
            />
            <label>Удаление пользователя</label>
        </div>
        <div class="component-userinfo__container">
            <span>Фамилия:</span>
            <input type="text" v-model="surname" class="userinfo__input" />
            <br />
            <span>Имя:</span>
            <input type="text" v-model="name" class="userinfo__input" />
            <br />
            <span>Отчество:</span>
            <input
                type="text"
                v-model="patronymic"
                class="userinfo__input"
            />
            <br />
            <input
                type="checkbox"
                v-model="useRole"
                style="margin-right: 10px; transform: scale(1.5)"
            />
            <span>Должность:</span>
            <br />
            <input
                type="radio"
                v-model="role"
                value="Fireman"
                @click="info"
                class="userinfo__input"
                :disabled="!useRole"
            />
            <span>Пожарный</span>
            <input
                type="radio"
                v-model="role"
                value="Brigadier"
                @click="info"
                class="userinfo__input"
                :disabled="!useRole"
            />
            <span>Бригадир</span>
            <br />
            <input
                type="radio"
                v-model="role"
                value="Operator"
                @click="info"
                class="userinfo__input"
                :disabled="!useRole"
            />
            <span>Оператор</span>
            <br />
            <input
                type="radio"
                v-model="role"
                value="Admin"
                @click="info"
                class="userinfo__input"
                :disabled="!useRole"
            />
            <span>Администратор</span>
            <br />
            <span
                :class="{
                    'brigade-text__avaliable':
                        role === 'Fireman' || role === 'Brigadier',
                    'brigade-text__unavaliable':
                        role !== 'Fireman' && role !== 'Brigadier',
                }"
                >Бригада:</span
            >
            <input
                min="1"
                type="number"
                v-model="brigade"
                class="userinfo__input"
                :disabled="role !== 'Fireman' && role !== 'Brigadier' && useRole"
                @blur="correctBrigade"
            />
            <br />
            <span>Дата регистрации:</span>
            <span style="margin-left: 100px">от:</span
            ><input
                type="date"
                class="date__input userinfo__input"
                v-model="registrationDate_begin"
            />
            <span style="margin-left: 40px">до:</span
            ><input
                type="date"
                class="date__input userinfo__input"
                v-model="registrationDate_end"
            />
            <br />
            <span>Дата редактирования:</span>
            <span style="margin-left: 58px">от:</span
            ><input
                type="date"
                class="date__input userinfo__input"
                v-model="changeDate_begin"
            />
            <span style="margin-left: 40px">до:</span
            ><input
                type="date"
                class="date__input userinfo__input"
                v-model="changeDate_end"
            />
            <br />
            <button id="submit-button" @click="searchUsers">Найти</button>
            <div class="table__container">
                <table class="users__table">
                    <thead
                        style="
                            position: sticky;
                            top: 0;
                            background-color: white;
                            border: 1px solid black;
                            z-index: 10;
                        "
                    >
                        <tr style="height: var(--head-row-height)">
                            <th>
                                <input type="checkbox" class="checkbox" :disabled="!foundUsers.length" v-model="allSelected" @click="() => {allSelected = !allSelected; selectedUsers.fill(allSelected)}">
                                <span style="position: absolute; top: -3px; margin-left: 10px; font-size: small;">Выбрать<br>всех</span>
                            </th>
                            <th>ФИО</th>
                            <th>Должность</th>
                            <th>Бригада</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="row__table"
                            v-for="(user, index) in foundUsers"
                            :key="index"
                        >
                            <td style="width: 3%; text-align: center">
                                <input
                                    type="checkbox"
                                    class="checkbox"
                                    v-model="selectedUsers[index]"
                                    @click="handleCheckboxClick(index)"
                                />
                            </td>
                            <td style="width: 50%; padding-left: 10px">
                                {{
                                    user.firstName +
                                    " " +
                                    user.familyName +
                                    " " +
                                    user.fatherName
                                }}
                            </td>
                            <td style="padding-left: 10px">
                                {{ rolesTranslations[findRole(user)] }}
                            </td>
                            <td style="text-align: center; width: 8%">
                                {{
                                    user.brigadeNumber
                                        ? user.brigadeNumber
                                        : "-"
                                }}
                            </td>
                        </tr>
                        <tr
                            class="row__table"
                            v-if="foundUsers.length < 4"
                            v-for="index in 4 - foundUsers.length"
                        >
                            <td style="width: 3%; text-align: center">
                                <input
                                    type="checkbox"
                                    class="checkbox"
                                    disabled
                                />
                            </td>
                            <td style="width: 50%"></td>
                            <td></td>
                            <td style="width: 8%"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                style="
                    display: flex;
                    justify-content: center;
                    padding-right: 80px;
                "
            >
                <button
                    id="submit-button"
                    @click="showAlert = true"
                    :disabled="
                        !selectedUsers.reduce(
                            (acc, num) => acc || num,
                            false,
                        )
                    "
                >
                    Удалить
                </button>
            </div>
        </div>
        <div v-if="showAlert" class="alert__container">
            <img
                src="/icons/exit.svg"
                id="exit-icon-alert"
                @click="showAlert = false"
            />
            <span
                style="
                    position: absolute;
                    top: 30%;
                    left: 50%;
                    transform: translate(-50%, -30%);
                "
                >Вы действительно хотите удалить пользователя?</span
            >
            <br />
            <button class="delete__button" @click="deleteSelectedUsers">
                Удалить
            </button>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import query from "../common/query.js";
import range from "../common/range.js";

export default {
    name: "DeleteUserComponent",
    data() {
        return {
            name: "",
            surname: "",
            patronymic: "",
            role: "Fireman",
            brigade: "",

            registrationDate_begin: "",
            registrationDate_end: "",
            changeDate_begin: "",
            changeDate_end: "",

            foundUsers: [],
            selectedUsers: [],
            showAlert: false,
            allSelected: false,
            rolesTranslations: {
                Brigadier: "Бригадир",
                Fireman: "Пожарный",
                Operator: "Оператор",
                Admin: "Администратор",
            },
            useRole: false
        };
    },
    methods: {
        async searchUsers() {
            const data = await query("user_search", {
                familyName: this.surname,
                firstName: this.name,
                fatherName: this.patronymic,
                role: this.useRole ? this.role : undefined,
                brigadeNumber:
                    (this.role === "Fireman" || this.role === "Brigadier") && this.useRole || !this.useRole
                        ? this.brigade
                        : "",
                registeredAt: range(
                    this.registrationDate_begin,
                    this.registrationDate_end,
                ),
                modifiedAt: range(this.changeDate_begin, this.changeDate_end),
            });
            if (data === null) return;
            this.foundUsers = data;
            this.allSelected = false;
            this.selectedUsers = Array(this.foundUsers.length).fill(false);
        },
        async deleteSelectedUsers() {
            this.showAlert = false;

            for(let i = 0; i < this.foundUsers.length; i++){
                if(this.selectedUsers[i]){
                    await axios.get(`http://localhost:3000/api/remove_user?login=${this.foundUsers[i].login}`);
                }
            }

            this.foundUsers = [];
            this.selectedUsers = [];
            this.allSelected = false;
            this.$emit("component-change", "menu");
        },
        handleCheckboxClick(index) {
            if (this.selectedUsers[index]) this.allSelected = false;
            else {
                this.selectedUsers[index] = true;
                if (this.selectedUsers.reduce((acc, num) => acc && num))
                    this.allSelected = true;
            }
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
    },
};
</script>

<style scoped>
.searchUser__container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 24px;
}

.component-label__container {
    text-align: center;
    border-radius: 20px 20px 0 0;
    padding: 10px;
    background-color: white;
    position: relative;
}

.component-label__container>label {
    font-size: xx-large;
    font-weight: bolder;
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

.component-userinfo__container {
    border-radius: 0 0 20px 20px;
    background-color: white;
    padding-left: 4vw;
    padding-top: 2vw;
    padding-bottom: 2vh;
    flex: 1;
}

.userinfo__input, span {
    font-size: x-large;
    margin-bottom: 10px;
}

.userinfo__input {
    margin-left: 20px;
}

input[type="text"]{
    width: 30vw;
}

input[type="number"] {
    width: 50px;
}

input[type="radio"] {
    cursor: pointer;
    transform: scale(2.5);
    margin: 20px
}

.brigade-text__avaliable {
    color: black;
}

.brigade-text__unavaliable {
    color: gray;
}

.date__input {
    padding: 0.5vw;
}

#submit-button {
    font-size: x-large;
    border-radius: 10px;
    border: none;
    padding: 10px 20px 10px 20px;
    background-color: #a7a3cc;
    margin-bottom: 10px;
}

#submit-button:not(:disabled) {
    cursor: pointer;
}

#submit-button:hover:not(:disabled) {
    background-color: #766ebf;
}

.table__container {
    --row-height: 35px;
    --head-row-height: 33px;

    width: 95%;
    font-size: large;
    overflow-y: scroll;
    max-height: calc(
        var(--head-row-height) + 4 * var(--row-height)
    );
    margin-bottom: 10px;
}

.users__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.row__table {
    height: var(--row-height);
}

.row__table > td {
    border: 1px solid black;
    position: relative;
}

.checkbox {
    transform: scale(2);
}

.checkbox:hover {
    cursor: pointer;
}

.alert__container {
    position: absolute;
    border: 5px solid #bf6e6e;
    background-color: white;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    border-radius: 13px;
    width: 80%;
    height: 40%;
    font-size: medium;
    font-weight: bolder;
}

.delete__button {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, -0%);
    border: none;
    background-color: #bf6e6e;
    font-size: x-large;
    border-radius: 13px;
    width: 30%;
    height: 30%;
    cursor: pointer;
}

.delete__button:hover {
    background-color: #8d5151;
}

#exit-icon-alert {
    position: absolute;
    cursor: pointer;
    padding: 10px;
    right: -5px;
    top: -5px;
    height: auto;
    background-color: #bf6e6e;
    border-radius: 10px;
}

#exit-icon-alert:hover {
    background-color: #8d5151;
}

@media (max-height: 800px){
    .component-label__container>label {
        font-size: x-large;
        font-weight: bolder;
    }
    .userinfo__input, span {
        font-size:medium;
        margin-bottom: 5px;
    }
    input[type="radio"] {
        cursor: pointer;
        transform: scale(2);
        margin: 15px;
    }
    #submit-button {
        font-size: medium;
        margin-bottom: 5px;
    }
    .editButton {
        cursor: pointer;
        transform: scale(1);
    }
    .checkbox {
        transform: scale(150%);
    }
    .table__container {
        margin-bottom: 5px;
        font-size: medium;
        max-height: calc(
            var(--head-row-height) + 3 * var(--row-height)
        );
    }
}
</style>
