<template>
    <div class="searchUser__container">
        <div style="display: flex; flex-direction: column; gap: 2px;" :class="{'blured-content__container': showAlert}">
            <div class="component-label__container">
                <img id="exit-icon" src="/icons/exit.svg" @click="$emit('component-change', 'menu')">
                <label>Удаление пользователя</label>
            </div>
            <div class="component-userinfo__container">
                <span>Фамилия:</span>
                <input type="text" v-model="surname" class="userinfo__input">
                <br>
                <span>Имя:</span>
                <input type="text" v-model="name" class="userinfo__input">
                <br>
                <span>Отчество:</span>
                <input type="text" v-model="patronymic" class="userinfo__input">
                <br> 
                
                <span>Должность:</span>
                <br>
                <input type="radio" v-model="role" value="Пожарный" @click="info" class="userinfo__input">
                <span>Пожарный</span>
                <br>
                <input type="radio" v-model="role" value="Оператор" @click="info" class="userinfo__input">
                <span>Оператор</span>
                <br>
                <input type="radio" v-model="role" value="Администратор" @click="info" class="userinfo__input">
                <span>Администратор</span>
                <br>

                <span :class="{'brigade-text__avaliable': role === 'Пожарный', 'brigade-text__unavaliable': role !== 'Пожарный'}">Бригада:</span>
                <input min="1" type="number" v-model="brigade" class="userinfo__input" :disabled="role !== 'Пожарный'" @blur="correctBrigade">
                <br>

                <span>Дата регистрации:</span>
                <span style="margin-left: 100px;">от:</span><input type="date" class="date__input userinfo__input" v-model="registrationDate_begin">
                <span style="margin-left: 40px;">до:</span><input type="date" class="date__input userinfo__input" v-model="registrationDate_end">
                <br>
                <span>Дата редактирования:</span>
                <span style="margin-left: 58px;">от:</span><input type="date" class="date__input userinfo__input" v-model="changeDate_begin">
                <span style="margin-left: 40px;">до:</span><input type="date" class="date__input userinfo__input" v-model="changeDate_end">
                <br>

                <button id="submit-button" @click="searchUsers">Найти</button>

                <div class="table__container">
                    <table class="users__table">
                        <thead style="position: sticky; top: 0; background-color: white; border: 1px solid black; z-index: 10;">
                            <tr>
                                <th style="position: absolute; left: 8px; top: 8px;">
                                    <input type="checkbox" class="checkbox" :disabled="!foundUsers.length" v-model="allSelected" @click="() => {allSelected = !allSelected; selectedUsers.fill(allSelected)}">
                                    <span style="margin-left: 10px; font-size: medium;">Выбрать всех</span>
                                </th>
                                <th>ФИО</th>
                                <th>Должность</th>
                                <th>Бригада</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="row__table" v-for="(user, index) in foundUsers" :key="index">
                                <td style="width: 3%; text-align: center;">
                                    <input type="checkbox" class="checkbox" v-model="selectedUsers[index]" @click="handleCheckboxClick(index)">
                                </td>
                                <td style="width: 50%; padding-left: 10px;">{{ user.name + ' ' + user.surname + ' ' + user.patronymic }}</td>
                                <td style="padding-left: 10px;">{{ user.role }}</td>
                                <td style="text-align: center; width: 8%">{{ user.brigade ? user.brigade : '-' }}</td>
                            </tr>    
                            <tr class="row__table" v-if="foundUsers.length < 4" v-for="index in (4 - foundUsers.length)">
                                <td style="width: 3%; text-align: center;">
                                    <input type="checkbox" class="checkbox" disabled>
                                </td>
                                <td style="width: 50%"></td>
                                <td></td>
                                <td style="width: 8%"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="display: flex; justify-content: center; padding-right: 80px;">
                    <button id="submit-button" @click="showAlert=true" :disabled="!selectedUsers.reduce((acc, num) => acc || num, false)">Удалить</button>
                </div>
            </div>
        </div>
        <div v-if="showAlert" class="alert__container">
            <img src="/icons/exit.svg" id="exit-icon-alert" @click="showAlert=false">
            <span style="position: absolute; top: 30%; left: 50%; transform: translate(-50%, -30%);">Вы действительно хотите удалить пользователя?</span>
            <br>
            <button class="delete__button" @click="deleteSelectedUsers">Удалить</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DeleteUserComponent',
    data() {
        return {
            name: '',
            surname: '',
            patronymic: '',
            role: '',
            brigade: '',

            registrationDate_begin: '',
            registrationDate_end: '',
            changeDate_begin: '',
            changeDate_end: '',

            foundUsers: [],
            selectedUsers: [],
            showAlert: false,
            allSelected: false,
            DBResult: [ // Нужен чисто для примера возвращаемого запроса из БД
                {
                    name: 'Виталий',
                    surname: 'Цаль',
                    patronymic: 'Величайший',
                    role: 'Администратор',
                    brigade: null,
                    phone: '+123456789',
                    email: 'bogdan@gmail.com',
                    adress: 'Винница',
                    login: 'EvilArthas',
                    password: '11111111'
                },
                {
                    name: 'Александр',
                    surname: '???',
                    patronymic: 'Владимирович',
                    role: 'Пожарный',
                    brigade: '1',
                    phone: '7862134678',
                    email: 'ne_objshnik@gmail.com',
                    adress: 'Russia',
                    login: 'rkgj4823f',
                    password: 'zlodeybosinn'
                },
                {
                    name: 'Edward',
                    surname: 'Kenway',
                    patronymic: '',
                    role: 'Оператор',
                    brigade: null,
                    phone: '7862134678',
                    email: 'pirate@mail.ru',
                    adress: 'Russian Federation, Surgut',
                    login: 'quququeu',
                    password: '1z2x3c4v'
                },
                {
                    name: 'Edward',
                    surname: 'Kenway',
                    patronymic: '',
                    role: 'Оператор',
                    brigade: null,
                    phone: '7862134678',
                    email: 'pirate@mail.ru',
                    adress: 'Russian Federation, Surgut',
                    login: 'truepirate',
                    password: 'adsasdq314'
                },
                {
                    name: 'Edward',
                    surname: 'Kenway',
                    patronymic: '',
                    role: 'Оператор',
                    brigade: null,
                    phone: '7862134678',
                    email: 'pirate@mail.ru',
                    adress: 'Russian Federation, Surgut',
                    login: 'meow',
                    password: '14warttg3456t'
                }
            ]
        }
    },
    methods: {
        searchUsers(){
            this.foundUsers = this.DBResult; //Магический запрос к БД
            this.selectedUsers = Array(this.foundUsers.length).fill(false);
        },
        deleteSelectedUsers(){
            this.showAlert = false;

            let logins = [];
            this.selectedUsers.forEach((isSelected, index) => {
                if(isSelected) logins.push(this.foundUsers[index].login)
            })

            // Представим что тут есть запрос на удаление пользователей по взятым логинам
            this.DBResult = this.DBResult.filter(item => !logins.includes(item.login))

            this.foundUsers = [];
            this.selectedUsers = [];    
            this.allSelected = false;
            this.$emit('component-change', 'menu');
        },
        handleCheckboxClick(index){
            if(this.selectedUsers[index]) this.allSelected = false;
            else{
                this.selectedUsers[index] = true;
                if(this.selectedUsers.reduce((acc, num) => acc && num)) this.allSelected = true;
            }
        }
    }
}
</script>

<style scoped>
.searchUser__container {
    width: 100%;
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: relative;
}

.blured-content__container {
    filter: blur(5px);
    pointer-events: none;
}

.component-label__container {
    text-align: center;
    border-radius: 20px 20px 0 0;
    padding: 10px;
    background-color: white;
}

.component-label__container>label {
    font-size: xx-large;
}

#exit-icon {
    position: absolute;
    cursor: pointer;
    padding: 10px;
    right: 6px;
    top: 6px;
    height: auto;
}

#exit-icon:hover {
    background-color: rgb(128, 128, 128, 0.2);
    border-radius: 10px;
}

.component-userinfo__container {
    border-radius: 0 0 20px 20px;
    background-color: white;
    height: 100%;
    padding-left: 80px;
    padding-top: 40px;
}

.userinfo__input, span, .table__container, #submit-button {
    font-size: x-large;
    margin-bottom: 10px;
}

.userinfo__input {
    margin-left: 20px;
}

input[type="text"]{
    width: 600px;
}

input[type="number"]{
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
    padding: 10px;
}

#submit-button {
    font-size: x-large;
    border-radius: 10px;
    border: none;
    padding: 10px 20px 10px 20px;
    background-color: #A7A3CC;
}

#submit-button:not(:disabled) {
    cursor: pointer;
}

#submit-button:hover:not(:disabled) {
    background-color: #766EBF;
}

.table__container {
    width: 95%;
    font-size: large;
    max-height: 185px;
    overflow-y: scroll;
}

.users__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.row__table>td {
    border: 1px solid black;
    height: 33px;
}

th {
    height: 35px;
}

.checkbox {
    transform: scale(2);
}

.alert__container {
    position: absolute;
    border: 5px solid #BF6E6E;
    background-color: white;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    border-radius: 13px;
    width: 80%;
    height: 40%;
    font-size: xx-large;
    font-weight: bolder;
}

.delete__button {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, -0%);
    border: none;
    background-color: #BF6E6E;
    font-size: xx-large;
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
    background-color: #BF6E6E;
    border-radius: 10px;
}

#exit-icon-alert:hover {
    background-color: #8d5151;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  cursor: not-allowed;
}
</style>