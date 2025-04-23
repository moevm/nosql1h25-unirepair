<template>
    <div class="layout">
        <Sidebar />
        <div class="content__container">
            <div class="table__label">
                <RouterLink id="exit-icon" to="/db">
                    <img src="/icons/exit.svg">
                </RouterLink>
                <label style="font-size: xx-large;">Формы вызова</label>
            </div>
            <div class="table-field__container">
                <div>
                    <div>
                        <input type="checkbox" v-model="useStatus" style="margin-right: 10px; transform: scale(1.5);">
                        <span>Статус:</span>
                        <input type="radio" v-model="status" value="Complete" class="text__input" :disabled="!useStatus"><span>Завершен</span>
                        <input type="radio" v-model="status" value="Incomplete" class="text__input" :disabled="!useStatus"><span>Не завершен</span>
                    </div>
                    <span>Дата создания:  </span>
                    <span>от:</span>
                    <input type="date" v-model="created.from" class="text__input" style="padding: 5px;">
                    <span>до:</span>
                    <input type="date" v-model="created.to" class="text__input" style="padding: 5px;">
                    <span>Дата последнего обновления:  </span>
                    <span>от:</span>
                    <input type="date" v-model="lastUpdate.from" class="text__input" style="padding: 5px;">
                    <span>до:</span>
                    <input type="date" v-model="lastUpdate.to" class="text__input" style="padding: 5px;">
                    <br>
                    <span>Источник вызова:</span>
                    <input type="text" v-model="callSource" class="text__input">
                    <span>Характер пожара:</span>
                    <input type="text" v-model="fireDescription" class="text__input">
                    <div>
                        <input type="checkbox" v-model="useRank" style="margin-right: 10px; transform: scale(1.5);">
                        <span>Ранг пожара:</span>
                        <input type="radio" v-model="fireRank" value="1" class="text__input" :disabled="!useRank"><span>1</span>
                        <input type="radio" v-model="fireRank" value="1-BIS" class="text__input" :disabled="!useRank"><span>1-БИС</span>
                        <input type="radio" v-model="fireRank" value="2" class="text__input" :disabled="!useRank"><span>2</span>
                        <input type="radio" v-model="fireRank" value="3" class="text__input" :disabled="!useRank"><span>3</span>
                        <input type="radio" v-model="fireRank" value="4" class="text__input" :disabled="!useRank"><span>4</span>
                        <span style="margin-left: 20px;">Адрес:</span>
                        <input type="text" v-model="fireAddress" class="text__input">
                    </div>
                    <span>Количество жертв:  </span>
                    <span>от:</span>
                    <input type="number" v-model="victims.from" class="text__input" style="width: 50px" min="0" @blur="victims.from < 0 && victims.from !== '' ? victims.from = 0 : true">
                    <span>до:</span>
                    <input type="number" v-model="victims.to" class="text__input" style="width: 50px" min="0" @blur="victims.to < 0 && victims.to !== '' ? victims.to = 0 : true">
                    <span>Прикрепленная бригада:</span>
                    <input type="number" min="1" v-model="brigade" @blur="(brigade < 1 && brigade !== '') ? brigade = 1 : true" style="width: 50px;" class="text__input">
                    <button @click="search" id="submit-button">Найти</button>
                    <button @click="reset" id="submit-button" style="margin-left: 10px;">Сбросить</button>
                </div>

                <div class="table__container">
                    <table>
                        <thead style="position: sticky; top: 0; background-color: white; border: 1px solid black;">
                            <tr>
                                <th style="width: 10%;">Статус</th>
                                <th style="width: 8%;">Время создания</th>
                                <th style="width: 8%;">Последнее обновление</th>
                                <th style="width: 10%;">Источник вызова</th>
                                <th style="width: 10%;">Адрес</th>
                                <th style="width: 14%;">Локализация пожара</th>
                                <th style="width: 10%;">Характер пожара</th>
                                <th style="width: 5%;">Ранг пожара</th>
                                <th style="width: 10%;">Пострадавшие</th>
                                <th style="width: 10%;">Прикреплённая пригада</th>
                                <th style="width: 10%;">Автомобиль</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(callForm, index) in foundCallForms" :key="index">
                                <td style="width: 10%;">{{ statusTranslations[findStatus(callForm)] }}</td>
                                <td style="width: 8%;">{{ formDate(callForm.createdAt) }}</td>
                                <td style="width: 8%;">{{ formDate(callForm.modifiedAt) }}</td>
                                <td style="width: 10%;">{{ callForm.callSource }}</td>
                                <td style="width: 10%;">{{ callForm.fireAddress }}</td>
                                <td style="width: 14%;">{{ `(${callForm.bottomLeft.x};${callForm.bottomLeft.y}) (${callForm.topRight.x};${callForm.topRight.y})` }}</td>
                                <td style="width: 10%;">{{ callForm.fireType }}</td>
                                <td style="width: 5%;">{{ callForm.fireRank }}</td>
                                <td style="width: 10%;">{{ callForm.victimsCount }}</td>
                                <td style="width: 10%;">{{ callForm.assignedTo }}</td>
                                <td style="width: 10%; word-wrap: break-word; word-break: break-all; white-space: normal;">{{ callForm.auto ? callForm.auto : '-' }}</td>
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
    name: 'DBCallForms',
    components: { Sidebar },
    data() {
        return {
            status: 'Complete',
            created: {from: '', to: ''},
            lastUpdate: {from: '', to: ''},
            callSource: '',
            fireAddress: '',
            fireDescription: '',
            fireRank: '1',
            victims: {from: '', to: ''},
            brigade: '',

            useStatus: false,
            useRank: false,
            foundCallForms: [],
            statusTranslations: {
                'Complete': 'Завершен',
                'Incomplete': 'Не завершен'
            }
        }
    },
    methods: {
        async search(){
            await axios.get(`http://localhost:3000/api/callform_search?${this.stringifyURLParams()}`)
                .then(res => this.foundCallForms = res.data);
            console.log(this.stringifyURLParams())
        },
        stringifyURLParams(){
            let params = {
                status: this.useStatus ? this.status : '',
                createdAt: `${this.created.from};${this.created.to}`,
                modifiedAt: `${this.lastUpdate.from};${this.lastUpdate.to}`,
                callSource: this.callSource,
                fireAddress: this.fireAddress,
                fireType: this.fireDescription,
                fireRank: this.useRank ? this.fireRank : '',
                victimsCount: `${this.victims.from ? this.victims.from : 0};${this.victims.to ? this.victims.to : 9999999}`,
                assignedTo: this.brigade,
            }

            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ';')
            )).toString();

            return params;
        },
        findStatus(user){
            return user.labels.find(label => (label === 'Complete' || label === 'Incomplete'))
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
            this.status = 'Complete';
            this.created = {from: '', to: ''};
            this.lastUpdate = {from: '', to: ''};
            this.callSource = '';
            this.fireDescription = '';
            this.fireRank = '1';
            this.victims = {from: '', to: ''};
            this.brigade = '';
            this.useRank = false;
            this.useStatus = false;
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
}
</style>