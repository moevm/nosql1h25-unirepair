<template>
    <div class="addUser__container">
        <div class="component-label__container">
            <img id="exit-icon" src="/icons/exit.svg" @click="$emit('component-change', 'menu')">
            <label>Создание нового пользователя</label>
        </div>
        <div class="component-userinfo__container">
            <span>Фамилия</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="surname" class="userinfo__input">
            <span v-show="!surname && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Имя</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="name" class="userinfo__input">
            <span v-show="!name && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Отчество:</span>
            <input type="text" v-model="patronymic" class="userinfo__input">
            <br> 
            
            <span>Должность</span><span style="color: red;">*</span><span>:</span>
            <span v-show="!role && addUserAttempt" style="color: red; margin-left: 15px;">Выберите должность</span>
            <br>
            <input type="radio" v-model="role" value="Fireman" @click="info" class="userinfo__input">
            <span>Пожарный</span>
            <input type="radio" v-model="role" value="Brigadier" @click="info" class="userinfo__input">
            <span>Бригадир</span>
            <br>
            <input type="radio" v-model="role" value="Operator" @click="info" class="userinfo__input">
            <span>Оператор</span>
            <br>
            <input type="radio" v-model="role" value="Admin" @click="info" class="userinfo__input"><span>Администратор</span>
            <br>

            <span :class="{'brigade-text__avaliable': role === 'Fireman' || role === 'Brigadier', 'brigade-text__unavaliable': role !== 'Fireman' && role !== 'Brigadier'}">Бригада</span>
            <span style="color: red;" v-show="role === 'Fireman' || role === 'Brigadier'">*</span><span>:</span>
            <input min="1" type="number" v-model="brigade" class="userinfo__input" :disabled="role !== 'Fireman' && role !== 'Brigadier'" @blur="correctBrigade">
            <span v-show="!brigade && addUserAttempt && (role === 'Fireman' || role === 'Brigadier')" style="color: red; margin-left: 15px;">Назначьте бригаду</span>
            <br>
            <span>Телефон:</span>
            <input type="text" v-model="phone" class="userinfo__input">
            <br>
            <span>Эл. почта:</span>
            <input type="text" v-model="email" class="userinfo__input">
            <br>
            <span>Адрес</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="address" class="userinfo__input">
            <span v-show="!address && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Логин</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="login" class="userinfo__input">
            <span v-show="!login && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Пароль</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="password" class="userinfo__input">
            <span v-show="!password && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
        
            <button @click="createNewUser" id="submit-button">Добавить пользователя</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "AddUserComponent",
    data() {
        return {
            name: '',
            surname: '',
            patronymic: '',
            role: '',
            brigade: '',
            phone: '',
            email: '',
            address: '',
            login: '',
            password: '',
            addUserAttempt: false,
        }
    },
    methods: {
        async createNewUser(){
            if(!this.name || !this.surname || !this.role || (!this.brigade && this.role === "Fireman") || !this.address || !this.login || !this.password){
                this.addUserAttempt = true;
                return false;
            }

            console.log("New user added: ", this.name, this.surname, this.patronymic, this.role, this.brigade, this.phone, this.email, this.address, this.login, this.password);

            console.log(`localhost:3000/api/user_spawn?${decodeURIComponent(this.stringifyURLParams())}`)   
            await axios.get(`http://localhost:3000/api/user_spawn?${this.stringifyURLParams()}`)

            this.name = '';
            this.surname = '';
            this.patronymic = '';
            this.role = '';
            this.brigade = '';
            this.phone = '';
            this.email = '';
            this.address = '';
            this.login = '';
            this.password = '';
            this.addUserAttempt = false;
            
            this.$emit('component-change', 'menu');
            return true;
        },
        correctBrigade(){
            if(this.brigade < 1){
                this.brigade = ''
            }
        },
        stringifyURLParams(){
            let params = {
                familyName: this.surname,
                firstName: this.name,
                fatherName: this.patronymic,
                role: this.role,
                brigadeNumber: this.role === 'Fireman' || this.role === 'Brigadier' ? this.brigade : undefined,
                address: this.address,
                phone: this.phone,
                email: this.email,
                login: this.login,
                password: this.password
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
.addUser__container {
    width: 100%;
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    padding-left: 80px;
    padding-top: 40px;
}

.userinfo__input, span {
    font-size: x-large;
    margin-bottom: 25px;
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
    transform: scale(3);
    margin: 30px;
}

#submit-button {
    position: absolute;
    cursor: pointer;
    right: 60px;
    bottom: 50px;
    font-size: xx-large;
    border-radius: 10px;
    border: none;
    padding: 20px;
    background-color: #A7A3CC;
}

#submit-button:hover {
    background-color: #766EBF;
}

.brigade-text__avaliable {
    color: black;
}

.brigade-text__unavaliable {
    color: gray;
}
</style>