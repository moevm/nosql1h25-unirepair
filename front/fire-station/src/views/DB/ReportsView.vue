<template>
<div class="layout">
        <Sidebar />
        <div class="content__container">
            <div class="table__label">
                <RouterLink id="exit-icon" to="/db">
                    <img src="/icons/exit.svg">
                </RouterLink>
                <label style="font-size: xx-large;">Отчёты</label>
            </div>
            <div class="table-field__container">
                <div>
                    <div>
                        <input type="checkbox" v-model="useStatus" style="margin-right: 10px; transform: scale(1.5);">
                        <span>Статус:</span>
                        <input type="radio" v-model="status" value="Complete" class="text__input" :disabled="!useStatus"><span>Завершен</span>
                        <input type="radio" v-model="status" value="Incomplete" class="text__input" :disabled="!useStatus"><span>Не завершен</span>
                        <input type="radio" v-model="status" value="New" class="text__input" :disabled="!useStatus"><span>Новый</span>
                    </div>
                    
                    <span>Расход воды:</span>
                    <input type="number" min="0" v-model="waterSpent" @blur="(waterSpent < 0 && waterSpent !== '') ? waterSpent = 0 : true" style="width: 50px;" class="text__input">
                    <span>Расход пены:</span>
                    <input type="number" min="0" v-model="foamSpent" @blur="(foamSpent < 0 && foamSpent !== '') ? foamSpent = 0 : true" style="width: 50px;" class="text__input">
                    <span>Предполагаемая причина пожара:</span>
                    <input type="text" v-model="allegedFireCause" class="text__input">
                    <br>
                    <span>Оценка ущерба:</span>
                    <input type="number" min="0" v-model="damage" @blur="(damage < 0 && damage !== '') ? damage = 0 : true" style="width: 50px;" class="text__input">
                    <span>Дополнительная информация:</span>
                    <input type="text" v-model="additionalNotes" class="text__input">
                    <br>
                    <span>Время сохранения:  </span>
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
                                <th style="width: 10%;">Статус</th>
                                <th style="width: 5%;">Расход воды</th>
                                <th style="width: 5%;">Расход пены</th>
                                <th style="width: 20%;">Предполагаемая причина пожара</th>
                                <th>Оценка ущерба</th>
                                <th style="width: 30%">Дополнительная информация</th>
                                <th>Время сохранения</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(report, index) in foundReports" :key="index">
                                <td style="width: 10%;">{{ statusTranslations[findStatus(report)] }}</td>
                                <td style="width: 5%;">{{ report.waterSpent }}</td>
                                <td style="width: 5%;">{{ report.foamSpent }}</td>
                                <td style="width: 20%">{{ report.allegedFireCause }}</td>
                                <td>{{ report.damage }}</td>
                                <td>{{ report.additionalNotes }}</td>
                                <td>{{ formDate(report.modifiedAt) }}</td>
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
    name: 'ReportsView',
    components: { Sidebar },
    data() {
        return {
            status: "Complete",
            waterSpent: '',
            foamSpent: '',
            allegedFireCause: '',
            damage: '',
            additionalNotes: '',
            modifiedAt: {from: '', to: ''},

            useStatus: false,
            foundReports: [],
            statusTranslations: {
                'Complete': 'Завершен',
                'Incomplete': 'Не завершен',
                'New': 'Новый'
            }
        }
    },
    methods: {
        async search(){
            await axios.get(`http://localhost:3000/api/report_search?${this.stringifyURLParams()}`)
                .then(res => this.foundReports = res.data);
            console.log(this.foundReports)
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
                status: this.useStatus ? this.status : '',
                waterSpent: this.waterSpent,
                foamSpent: this.foamSpent,
                allegedFireCause: this.allegedFireCause,
                damage: this.damage,
                additionalNotes: this.additionalNotes,
                modifiedAt: processDateRange(this.modifiedAt.from, this.modifiedAt.to)
            }

            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ';')
            )).toString();

            return params;
        },
        findStatus(user){
            return user.labels.find(label => (label === 'Complete' || label === 'Incomplete' || label === 'New'))
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
            this.status = "Complete",
            this.waterSpent = '',
            this.foamSpent = '',
            this.allegedFireCause = '',
            this.damage = '',
            this.additionalNotes = '',
            this.modifiedAt = {from: '', to: ''}

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