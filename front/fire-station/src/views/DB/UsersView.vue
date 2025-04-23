<template>
    <div class="layout">
        <Sidebar />
        <div class="content__container">
            <div class="table__label">
                <RouterLink id="exit-icon" to="/db">
                    <img src="/icons/exit.svg">
                </RouterLink>
                <label style="font-size: xx-large;">Сотрудники</label>
            </div>
            <div class="table-field__container">
                <div>
                    <span>Фамилия:</span>
                    <input type="text" v-model="surname" class="text__input">
                    <span>Имя:</span>
                    <input type="text" v-model="name" class="text__input">
                    <span>Отчество:</span>
                    <input type="text" v-model="patronymic" class="text__input">
                    <br>
                    <div style="margin-bottom: 10px;">
                        <input type="checkbox" v-model="useRole" style="margin-right: 10px; transform: scale(1.5);">
                        <span>Должность:</span>
                        <input type="radio" v-model="role" value="Fireman" :disabled="!useRole"><span>Пожарный</span>
                        <input type="radio" v-model="role" value="Operator" :disabled="!useRole"><span>Оператор</span>
                        <input type="radio" v-model="role" value="Admin" :disabled="!useRole"><span>Администратор</span>
                        <input type="radio" v-model="role" value="Brigadier" :disabled="!useRole"><span>Бригадир</span>
                    </div>
                    <span>Бригада:</span>
                    <input type="number" min="1" v-model="brigade" :disabled="role !== 'Fireman' && role !== 'Brigadier' && useRole" @blur="(brigade < 1 && brigade !== '') ? brigade = 1 : true" style="width: 50px;" class="text__input">
                    <span>Адрес:</span>
                    <input type="text" v-model="address" class="text__input">
                    <span>Логин:</span>
                    <input type="text" v-model="login" class="text__input">
                    <br>
                    <span>Дата регистрации:  </span>
                    <span>от:</span>
                    <input type="date" v-model="registeredAt.from" class="text__input" style="padding: 5px;">
                    <span>до:</span>
                    <input type="date" v-model="registeredAt.to" class="text__input" style="padding: 5px;">
                    <br>
                    <span>Дата последнего изменения:  </span>
                    <span>от:</span>
                    <input type="date" v-model="modifiedAt.from" class="text__input" style="padding: 5px;">
                    <span>до:</span>
                    <input type="date" v-model="modifiedAt.to" class="text__input" style="padding: 5px;">
                    <button @click="search" id="submit-button">Найти</button>
                    <button @click="reset" id="submit-button" style="margin-left: 10px;">Сбросить</button>
                </div>

                <div class="table__container">
                    <table>
                        <thead style="position: sticky; top: 0; background-color: white; border: 1px solid black;">
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
                            <tr v-for="(user, index) in foundUsers" :key="index">
                                <td style="width: 8%">{{ user.firstName + ' ' + user.familyName + ' ' + user.fatherName }}</td>
                                <td style="width: 10%">{{ rolesTranslations[findRole(user)] }}</td>
                                <td style="width: 5%">{{ user.brigadeNumber > 0 ? user.brigadeNumber : '-' }}</td>
                                <td style="width: 10%">{{ user.address }}</td>
                                <td style="width: 10%">{{ user.phone }}</td>
                                <td style="width: 10%">{{ user.email }}</td>
                                <td style="width: 10%">{{ user.login }}</td>
                                <td style="word-wrap: break-word; word-break: break-all; white-space: normal; width: 10%">{{ user.passwordHash }}</td>
                                <td style="width: 5%">{{ formDate(user.registeredAt) }}</td>
                                <td style="width: 5%">{{ formDate(user.modifiedAt) }}</td>
                                <td style="width: 10%">{{ statusTranslations[findStatus(user)] }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';

export default {
    name: 'DBUsers',
    components: { Sidebar },
    data() {
        return {
            name: '',
            surname: '',
            patronymic: '',
            role: 'Fireman',
            brigade: '',
            address: '',
            phone: '',
            email: '',
            login: '',
            password: '',
            registeredAt: {from: '', to: ''},
            modifiedAt: {from: '', to: ''},
            status: '',

            useRole: false,
            foundUsers: [],
            rolesTranslations: {
                "Brigadier": "Бригадир",
                "Fireman": "Пожарный",
                "Operator": "Оператор",
                "Admin": "Администратор"
            },
            statusTranslations: {
                'Active': 'Активный',
                'Deleted': 'Удален'
            }
        }
    },
    methods: {
        async search(){
            await axios.get(`http://localhost:3000/api/user_search?${this.stringifyURLParams()}`)
                .then(res => this.foundUsers = res.data);
            console.log(this.foundUsers)
        },
        stringifyURLParams(){
            let params = {
                familyName: this.surname,
                firstName: this.name,
                fatherName: this.patronymic,
                role: this.useRole ? this.role : '',
                brigadeNumber: !this.useRole || this.useRole && (this.role === 'Fireman' || this.role === 'Brigadier') ? this.brigade : '',
                phone: this.phone,
                address: this.address,
                login: this.login,
                status: this.status,
                registeredAt: `${this.registeredAt.from};${this.registeredAt.to}`,
                modifiedAt: `${this.modifiedAt.from};${this.modifiedAt.to}`
            }

            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ';')
            )).toString();

            return params;
        },
        findRole(user){
            return user.labels.find(label => (label === "Brigadier" || label === "Fireman" || label === "Operator" || label === "Admin"))
        },
        findStatus(user){
            return user.labels.find(label => (label === 'Active' || label === 'Deleted'))
        },
        formDate(date){
            if(date.year){
                let year = date.year.low.toString();
                let month = date.month.low.toString();
                let day = date.day.low.toString();
                
                while(year.length < 4) year = '0' + year;
                while(month.length < 2) month = '0' + month;
                while(day.length < 2) day = '0' + day;
                
                return year + '-' + month + '-' + day;
            }

            return '-'
        },
        reset(){
            this.name = '',
            this.surname = '',
            this.patronymic = '',
            this.role = 'Fireman',
            this.brigade = '',
            this.address = '',
            this.phone = '',
            this.email = '',
            this.login = '',
            this.registeredAt = {from: '', to: ''},
            this.modifiedAt = {from: '', to: ''},
            this.status = ''
        }
    }
}
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}

#submit-button {
    cursor: pointer;
    font-size: x-large;
    border-radius: 10px;
    border: none;
    padding: 10px 20px 10px 20px;
    background-color: #A7A3CC;
}

#submit-button:hover {
    background-color: #766EBF;
}

.content__container {
    width: 100%;
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.table__label {
    text-align: center;
    border-radius: 20px 20px 0 0;
    padding: 10px;
    background-color: white;
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

.table-field__container {
    border-radius: 0 0 20px 20px;
    background-color: white;
    height: 100%;
    padding-left: 60px;
    padding-top: 30px;
}

.text__input {
    font-size: large;
    margin: 0 10px 10px 10px;
}

span {
    font-size: large;
}

.table__container {
    overflow-y: scroll;
    width: 96%;
    max-height: 548px;
}

table {
    border-collapse: separate;
    border-spacing: 0;
}

td, th {
    border: 1px solid black;
    height: 50px;
    text-align: center;
    padding: 0 5px 0 5px;
    font-size: small;
}
</style>