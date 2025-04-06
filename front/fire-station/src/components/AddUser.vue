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
            <input type="radio" v-model="role" value="Пожарный" @click="info" class="userinfo__input">
            <span>Пожарный</span>
            <br>
            <input type="radio" v-model="role" value="Оператор" @click="info" class="userinfo__input">
            <span>Оператор</span>
            <br>
            <input type="radio" v-model="role" value="Администратор" @click="info" class="userinfo__input"><span>Администратор</span>
            <br>

            <span>Бригада</span><span style="color: red;">*</span><span>:</span>
            <input type="number" v-model="brigade" class="userinfo__input">
            <span v-show="!brigade && addUserAttempt" style="color: red; margin-left: 15px;">Назначьте бригаду</span>
            <br>
            <span>Телефон:</span>
            <input type="text" v-model="phone" class="userinfo__input">
            <br>
            <span>Эл. почта:</span>
            <input type="text" v-model="email" class="userinfo__input">
            <br>
            <span>Адрес</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="adress" class="userinfo__input">
            <span v-show="!adress && addUserAttempt" style="color: red; margin-left: 15px;">Назначьте бригаду</span>
            <br>
            <span>Логин</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="login" class="userinfo__input">
            <span v-show="!login && addUserAttempt" style="color: red; margin-left: 15px;">Назначьте бригаду</span>
            <br>
            <span>Пароль</span><span style="color: red;">*</span><span>:</span>
            <input type="text" v-model="password" class="userinfo__input">
            <span v-show="!password && addUserAttempt" style="color: red; margin-left: 15px;">Назначьте бригаду</span>
            <br>
        
            <button @click="createNewUser" id="submit-button">Добавить пользователя</button>
        </div>
    </div>
</template>

<script>
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
            adress: '',
            login: '',
            password: '',
            addUserAttempt: false
        }
    },
    methods: {
        createNewUser(){
            if(!this.name || !this.surname || !this.brigade || !this.adress || !this.login || !this.password){
                this.addUserAttempt = true;
                return false;
            }
            console.log("New user added: ", this.name, this.surname, this.patronymic, this.role, this.brigade, this.phone, this.email, this.adress, this.login, this.password);

            //Тут запрос к серверу на добавление записи в БД, не забываем про время регистрации, время изменения и статус

            this.name = '';
            this.surname = '';
            this.patronymic = '';
            this.role = '';
            this.brigade = '';
            this.phone = '';
            this.email = '';
            this.adress = '';
            this.login = '';
            this.password = '';
            
            this.$emit('component-change', 'menu');
            return true;
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
    right: 40px;
    top: 40px;
    width: 25px;
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
    margin-bottom: 30px;
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
    bottom: 30px;
    font-size: xx-large;
    border-radius: 20px;
    border: none;
    padding: 20px;
    background-color: #A7A3CC;
}

#submit-button:hover {
    background-color: #766EBF;
}
</style>