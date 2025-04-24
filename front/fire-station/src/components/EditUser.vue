<template>
    <div class="addUser__container">
        <div class="component-label__container">
            <img id="exit-icon" src="/icons/exit.svg" @click=" () => {$emit('component-change', 'searchUser'); dropState()}">
            <label>Редактирование данных пользователя</label>
        </div>
        <div class="component-userinfo__container">
            <span>Фамилия:</span>
            <input type="text" v-model="editedUser.user.surname" class="userinfo__input">
            <span v-show="!editedUser.user.surname && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Имя:</span>
            <input type="text" v-model="editedUser.user.name" class="userinfo__input">
            <span v-show="!editedUser.user.name && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Отчество:</span>
            <input type="text" v-model="editedUser.user.patronymic" class="userinfo__input">
            <br> 
            
            <span>Должность:</span>
            <br>
            <input type="radio" v-model="editedUser.user.role" value="Fireman" class="userinfo__input">
            <span>Пожарный</span>
            <input type="radio" v-model="editedUser.user.role" value="Brigadier" class="userinfo__input">
            <span>Бригадир</span>
            <br>
            <input type="radio" v-model="editedUser.user.role" value="Operator" class="userinfo__input">
            <span>Оператор</span>
            <br>
            <input type="radio" v-model="editedUser.user.role" value="Admin" class="userinfo__input"><span>Администратор</span>
            <br>

            <span :class="{'brigade-text__avaliable': editedUser.user.role === 'Fireman' || editedUser.user.role === 'Brigadier', 'brigade-text__unavaliable': editedUser.user.role !== 'Fireman' &&  editedUser.user.role !== 'Brigadier'}">Бригада:</span>
            <input min="1" type="number" :v-model="editedUser.user.brigade" class="userinfo__input" :disabled="editedUser.user.role !== 'Fireman' && editedUser.user.role !== 'Brigadier'" @blur="correctBrigade">
            <span v-show="!editedUser.user.brigade && addUserAttempt && (editedUser.user.role === 'Fireman' || editedUser.user.role === 'Brigadier')" style="color: red; margin-left: 15px;">Назначьте бригаду</span>
            <br>
            <span>Телефон:</span>
            <input type="text" v-model="editedUser.user.phone" class="userinfo__input">
            <br>
            <span>Эл. почта:</span>
            <input type="text" v-model="editedUser.user.email" class="userinfo__input">
            <br>
            <span>Адрес:</span>
            <input type="text" v-model="editedUser.user.address" class="userinfo__input">
            <span v-show="!editedUser.user.address && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span class="brigade-text__unavaliable">Логин:</span>
            <input type="text" v-model="editedUser.user.login" disabled class="userinfo__input">
            <span v-show="!editedUser.user.login && addUserAttempt" style="color: red; margin-left: 15px;">Заполните это поле</span>
            <br>
            <span>Пароль:</span>
            <input type="text" v-model="editedUser.user.password" class="userinfo__input">
            <br>
        
            <button @click="updateUser" id="submit-button">Сохранить изменения</button>
        </div>
    </div>
</template>

<script>
import { useEditedUser } from '@/stores/editedUser';
import axios from 'axios';

export default{
    name: 'EditUserComponent',
    setup(){
        const editedUser = useEditedUser();
        return { editedUser };
    },
    data(){
        return {
            addUserAttempt: false
        }
    },
    methods: {
        async updateUser(){
            const user = useEditedUser().user;
            console.log(user.brigade)
            if(!user.name || !user.surname || !user.role || (!user.brigade && (user.role === "Fireman" || user.role === 'Brigadier')) || !user.address || !user.login){    
                this.addUserAttempt = true;
                return false;
            }
            
            await axios.get(`http://localhost:3000/api/modify_user?${this.stringifyURLParams()}`);
            console.log(`http://localhost:3000/api/modify_user?${decodeURIComponent(this.stringifyURLParams())}`)   

            this.dropState();
            this.$emit('component-change', 'searchUser');
        },
        dropState(){
            useEditedUser().updateData({
                name: '',
                surname: '',
                patronymic: '',
                role: '',
                brigade: '',
                phone: '',
                email: '',
                address: '',
                login: '',
                password: ''
            });
            this.addUserAttempt = false;
        },
        stringifyURLParams(){
            const user = useEditedUser().user;
            let params = {
                familyName: user.surname,
                firstName: user.name,
                fatherName: user.patronymic,
                role: user.role,
                brigadeNumber: user.role === 'Fireman' || user.role === 'Brigadier' ? user.brigade : '',
                phone: user.phone,
                address: user.address,
                email: user.email,
                login: useEditedUser().oldLogin,
                password: user.password
            }
            
            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ',')
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