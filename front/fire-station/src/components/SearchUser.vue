<template>
    <div class="searchUser__container">
        <div class="component-label__container">
            <img id="exit-icon" src="/icons/exit.svg" @click="$emit('component-change', 'menu')">
            <label>Редактировать данные пользователя</label>
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
            <input type="radio" v-model="role" value="Fireman" @click="info" class="userinfo__input">
            <span>Пожарный</span>
            <input type="radio" v-model="role" value="Brigadier" @click="info" class="userinfo__input">
            <span>Бригадир</span>
            <br>
            <input type="radio" v-model="role" value="Operator" @click="info" class="userinfo__input">
            <span>Оператор</span>
            <br>
            <input type="radio" v-model="role" value="Admin" @click="info" class="userinfo__input">
            <span>Администратор</span>
            <br>

            <span :class="{'brigade-text__avaliable': role === 'Fireman' || role === 'Brigadier', 'brigade-text__unavaliable': role !== 'Fireman' && role !== 'Brigadier'}">Бригада:</span>
            <input min="1" type="number" v-model="brigade" class="userinfo__input" :disabled="role !== 'Fireman' && role !== 'Brigadier'" @blur="correctBrigade">
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
                            <th></th>
                            <th>ФИО</th>
                            <th>Должность</th>
                            <th>Бригада</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="row__table" v-for="(user, index) in foundUsers" :key="index">
                            <td style="width: 3%; text-align: center;">
                                <img src="/icons/editUser.svg" style="cursor: pointer; transform: scale(1);" @click="goToEditUserData(index)">
                            </td>
                            <td style="width: 50%; padding-left: 10px;">{{ user.familyName + ' ' + user.firstName + ' ' + user.fatherName }}</td>
                            <td style="padding-left: 10px;">{{ rolesTranslations[findRole(user)] }}</td>
                            <td style="text-align: center; width: 8%">{{ user.brigadeNumber > 0 ? user.brigadeNumber : '-' }}</td>
                        </tr>    
                        <tr class="row__table" v-if="foundUsers.length < 4" v-for="index in (4 - foundUsers.length)">
                            <td style="width: 3%; text-align: center;">
                                <img src="/icons/editUser.svg" style="cursor: pointer; transform: scale(1);">
                            </td>
                            <td style="width: 50%"></td>
                            <td></td>
                            <td style="width: 8%"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { useEditedUser } from '@/stores/editedUser';
import axios from 'axios';

export default {
    name: 'SearchUserComponent',
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
            rolesTranslations: {
                "Brigadier": "Бригадир",
                "Fireman": "Пожарный",
                "Operator": "Оператор",
                "Admin": "Администратор"
            }
        }
    },
    methods: {
        async searchUsers(){
            await axios.get(`http://localhost:3000/api/user_search?${this.stringifyURLParams()}`)
                .then(res => this.foundUsers = res.data);
        },
        goToEditUserData(index){
            const editedUser = useEditedUser();
            editedUser.updateData(this.foundUsers[index], this.findRole(this.foundUsers[index]), index);

            this.$emit('component-change', 'editUser');
            this.foundUsers = [];
        },
        findRole(user){
            return user.labels.find(label => (label === "Brigadier" || label === "Fireman" || label === "Operator" || label === "Admin"))
        },
        stringifyURLParams(){
            const processDateRange = (from, to) => {
                const today = new Date().toISOString().split('T')[0];
                const defaultFrom = '1990-01-01';
                
                if (from && to) return `${from};${to}`;

                if (from && !to) return `${from};${today}`;

                if (!from && to) return `${defaultFrom};${to}`;

                return '';
            };
            
            let params = {
                familyName: this.surname,
                firstName: this.name,
                fatherName: this.patronymic,
                role: this.role,
                brigadeNumber: this.role === 'Fireman' || this.role === 'Brigadier' ? this.brigade : '',
                registeredAt: processDateRange(this.registrationDate_begin, this.registrationDate_end),
                modifiedAt: processDateRange(this.changeDate_begin, this.changeDate_end)
            }

            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ';')
            )).toString();

            return params;
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
    box-sizing: border-box;
}

.component-label__container {
    text-align: center;
    border-radius: 20px 20px 0 0;
    padding: 10px;
    background-color: white;
}

.component-label__container>label {
    font-size: x-large;
    font-weight: bolder;
}

#exit-icon {
    position: absolute;
    cursor: pointer;
    padding: 10px;
    right: 30px;
    top: 30px;
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
    padding: 24px;
}

.userinfo__input, span {
    font-size: large;
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
    transform: scale(1.5);
    margin: 15px
}

.brigade-text__avaliable {
    color: black;
}

.brigade-text__unavaliable {
    color: gray;
}

.date__input {
    padding: 5px;
}

#submit-button {
    cursor: pointer;
    font-size: large;
    border-radius: 10px;
    border: none;
    padding: 10px 20px 10px 20px;
    background-color: #A7A3CC;
}

#submit-button:hover {
    background-color: #766EBF;
}

.table__container {
    width: 95%;
    font-size: medium;
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
    height: 23px;
}

th {
    height: 25px;
}
</style>