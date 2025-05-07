<template>
    <div class="searchUser__container">
        <div class="component-label__container">
            <img id="exit-icon" src="/icons/exit.svg" @click="$emit('component-change', 'menu')">
            <label>Найти/удалить отчеты</label>
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
            
            <input
                type="checkbox"
                v-model="useRole"
                style="margin-right: 10px; transform: scale(1.5)"
            />
            <span>Должность:</span>
            <br>
            <input type="radio" v-model="role" value="Fireman" @click="info" class="userinfo__input" :disabled="!useRole">
            <span>Пожарный</span>
            <input type="radio" v-model="role" value="Brigadier" @click="info" class="userinfo__input" :disabled="!useRole">
            <span>Бригадир</span>
            <br>
            <input type="radio" v-model="role" value="Operator" @click="info" class="userinfo__input" :disabled="!useRole">
            <span>Оператор</span>
            <br>
            <input type="radio" v-model="role" value="Admin" @click="info" class="userinfo__input" :disabled="!useRole"> 
            <span>Администратор</span>  
            <br>
            <span :class="{'brigade-text__avaliable': role === 'Fireman' || role === 'Brigadier', 'brigade-text__unavaliable': role !== 'Fireman' && role !== 'Brigadier'}">Бригада:</span>
            <input min="1" type="number" v-model="brigade" class="userinfo__input" :disabled="role !== 'Fireman' && role !== 'Brigadier' && useRole" @blur="correctBrigade">
            <br>
            <span>Дата вызова:</span>
            <span style="margin-left: 160px;">от:</span><input type="date" class="date__input userinfo__input" v-model="callDate_begin">
            <span style="margin-left: 40px;">до:</span><input type="date" class="date__input userinfo__input" v-model="callDate_end">
            <br>
            <span>Дата создания отчета:</span>
            <span style="margin-left: 58px;">от:</span><input type="date" class="date__input userinfo__input" v-model="createDate_begin">
            <span style="margin-left: 40px;">до:</span><input type="date" class="date__input userinfo__input" v-model="createDate_end">
            <br>
            <button id="submit-button" @click="searchReports">Отобразить</button>
            <div class="table__container">
                <table class="users__table">
                    <thead style="position: sticky; top: 0; background-color: white; border: 1px solid black; z-index: 10;">
                        <tr style="height: var(--head-row-height);">
                            <th>
                                <input type="checkbox" class="checkbox" :disabled="!foundReports.length" v-model="allSelected" @click="() => {allSelected = !allSelected; selectedReports.fill(allSelected)}">
                                <span style="position: absolute; top: -3px; margin-left: 10px; font-size: small;">Выбрать<br>всех</span>
                            </th>
                            <th>Название отчета</th>
                            <th>ФИО</th>
                            <th>Должность</th>
                            <th>Бр.</th>
                            <th>Дата создания</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="row__table" v-for="(report, index) in foundReports" :key="index">
                            <td style="width: 3%; text-align: center;">
                                <input type="checkbox" class="checkbox" v-model="selectedReports[index]" @click="handleCheckboxClick(index)">
                            </td>
                            <td style="width: 30%; padding-left: 10px">{{ formReportName(report.cf) }}</td>
                            <td style="width: 30%; padding-left: 10px;">{{ report.u.firstName + ' ' + report.u.familyName + ' ' + report.u.fatherName }}</td>
                            <td style="padding-left: 10px; width: 20%">{{ rolesTranslations[findRole(report.u)] }}</td>
                            <td style="text-align: center;">{{ report.u.brigadeNumber }}</td>
                            <td style="width: 15%; text-align: center;">{{ formData(report.r) }}</td>
                        </tr>    
                        <tr class="row__table" v-if="foundReports.length < 4" v-for="index in (4 - foundReports.length)">
                            <td style="width: 3%; text-align: center;">
                                <input type="checkbox" class="checkbox" disabled>
                            </td>
                            <td style="width: 30%"></td>
                            <td style="width: 30%"></td>
                            <td style="width: 20%"></td>
                            <td></td>
                            <td style="width: 15%"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="display: flex; justify-content: space-between; padding-right: 72px;">
                <button id="submit-button" @click="downloadSelectedReports" :disabled="!selectedReports.reduce((acc, num) => acc || num, false)">Скачать</button>
                <button id="submit-button" @click="showAlert=true" :disabled="!selectedReports.reduce((acc, num) => acc || num, false)">Удалить</button>
            </div>
        </div>
        <div v-if="showAlert" class="alert__container">
            <img src="/icons/exit.svg" id="exit-icon-alert" @click="showAlert=false">
            <span style="position: absolute; top: 30%; left: 50%; transform: translate(-50%, -30%);">Вы действительно хотите удалить отчёт(ы)?</span>
            <br>
            <button class="delete__button" @click="deleteSelectedReports">Удалить</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from "file-saver"

export default {
    name: 'DownloadDeleteReportComponent',
    data() {
        return {
            name: '',
            surname: '',
            patronymic: '',
            role: 'Fireman',
            brigade: '',
            reportName: '',
            createDate: '',

            callDate_begin: '',
            callDate_end: '',
            createDate_begin: '',
            createDate_end: '',

            foundReports: [],
            selectedReports: [],
            showAlert: false,
            allSelected: false,
            rolesTranslations: {
                "Brigadier": "Бригадир",
                "Fireman": "Пожарный",
                "Operator": "Оператор",
                "Admin": "Администратор"
            },
            useRole: false
        }
    },
    methods: {
        async searchReports(){
            await axios.get(`http://localhost:3000/api/report_search_by_author?${this.stringifyURLParams()}`)
                .then(res => this.foundReports = res.data)
            this.selectedReports = Array(this.foundReports.length).fill(false);
            this.allSelected = false;
        },
         async deleteSelectedReports(){
            this.showAlert = false;

            for(let i = 0; i < this.foundReports.length; i++){
                if(this.selectedReports[i]){
                    await axios.get(`http://localhost:3000/api/delete_report?reportId=${this.foundReports[i].r.id}`);
                }
            }

            this.foundReports = [];
            this.selectedReports = [];    
            this.allSelected = false;
            this.$emit('component-change', 'menu');
        },
        handleCheckboxClick(index){
            if(this.selectedReports[index]) this.allSelected = false;
            else {
                this.selectedReports[index] = true;
                if(this.selectedReports.reduce((acc, num) => acc && num)) this.allSelected = true;
            }
        },
        async downloadSelectedReports(){
            const zip = new JSZip();

            this.selectedReports.forEach((selected, index) => {
                if(selected){
                    const fileName = `${this.formReportName(this.foundReports[index].cf)}.json`;
                    const jsonData = JSON.stringify(this.foundReports[index].r, null, 2)
                    zip.file(fileName, jsonData);
                }
            })

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, this.formArchiveName());
        },
        formArchiveName(){
            let fullname = [this.surname ?? '', this.name ?? '', this.patronymic ?? ''].join('-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            let role = this.useRole ? this.rolesTranslations[this.role] : '';
            let brigade = this.brigade !== "" ? `Бр_${this.brigade}` : '';
            let callDate = `Вызов(${this.callDate_begin}~${this.callDate_end})`.replace(/^Вызов\(~\)$/g, '');
            let createDate = `Создан(${this.createDate_begin}~${this.createDate_end})`.replace(/^Создан\(~\)$/g, '');

            let archiveName = ["Отчеты", fullname, role, brigade, callDate, createDate].join(';').replace(/;+/g, ';').replace(/^;|;$/g, '')
            return `${archiveName}.zip`;
        },
        stringifyURLParams(){
            let params = {
                familyName: this.surname,
                firstName: this.name,
                fatherName: this.patronymic,
                role: this.useRole ? this.role : undefined,
                brigadeNumber: (this.role === 'Fireman' || this.role === 'Brigadier') && this.useRole || !this.useRole ? this.brigade : '',
                createdAt: `${this.callDate_begin};${this.callDate_end}`,
                modifiedAt: `${this.createDate_begin};${this.createDate_end}`
            }

            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ';')
            )).toString();

            return params;
        },
        formReportName(r){
            let day = r.createdAt.day.toString();
            while(day.length < 2) day = '0' + day;

            let month = r.createdAt.month.toString();
            while(month.length < 2) month = '0' + month;

            let year = r.createdAt.year.toString().slice(-2);
            while(year.length < 2) year = '0' + year;

            let hour = r.createdAt.hour.toString();
            while(hour.length < 2) hour = '0' + hour

            let minute = r.createdAt.minute.toString();
            while(minute.length < 2) minute = '0' + minute

            return `Rep_${day}.${month}.${year}_${hour}:${minute}_B-${r.assignedTo}`
        },
        findRole(user){
            return user.labels.find(label => (label === "Brigadier" || label === "Fireman" || label === "Operator" || label === "Admin"))
        },
        formData(r){
            let day = r.modifiedAt.day.toString();
            while(day.length < 2) day = '0' + day

            let month = r.modifiedAt.month.toString();
            while(month.length < 2) month = '0' + month

            let year = r.modifiedAt.year.toString();
            while(year.length < 2) year = '0' + year

            return `${year}-${month}-${day}`
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
    box-sizing: border-box;
}

.blured-content__container {
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
    font-weight: bolder;
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
    padding-left: 4vw;
    padding-top: 2vw;
}

.userinfo__input, span, .table__container, #submit-button {
    font-size: x-large;
    margin-bottom: 10px;
}

.userinfo__input {
    margin-left: 20px;
}

input[type="text"]{
    width: 30vw;
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
    padding: 0.5vw;
}

#submit-button {
    font-size: large;
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
    --row-height: 35px;
    --head-row-height: 33px;

    width: 95%;
    font-size: large;
    overflow-y: scroll;
    max-height: calc(
        var(--head-row-height) + 4 * var(--row-height)
    );
}

.users__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.row__table {
    height: var(--row-height)
}

.row__table>td {
    border: 1px solid black;
    position: relative;
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
    font-size: x-large;
    font-weight: bolder;
}

.delete__button {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, -0%);
    border: none;
    background-color: #BF6E6E;
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

@media (max-width: 1500px){
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

@media (max-width: 1500px){
    .component-label__container>label {
        font-size: x-large;
        font-weight: bolder;
    }
    .userinfo__input, span {
        font-size: large;
        margin-bottom: 5px;
    }
    input[type="radio"] {
        cursor: pointer;
        transform: scale(2);
        margin: 15px;
    }
    #submit-button {
        cursor: pointer;
        font-size: medium;
        border-radius: 10px;
        border: none;
        padding: 10px 20px 10px 20px;
        background-color: #A7A3CC;
    }
    .editButton {
        cursor: pointer;
        transform: scale(1);
    }
    .checkbox {
        transform: scale(150%);
    }
    .row__table>td {
        border: 1px solid black;
        height: 3.5vh;
        font-size: small;
    }

    th {
        height: 3.5vh;
        font-size: small;
    }
}
</style>
