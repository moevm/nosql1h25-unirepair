<template>
    <div class="statistics__container">
        <div class="statistics-options__container">
            <input type="radio" class="radio__input" v-model="selected" value="calls">
            <span>Вызовы</span>
            <br>
            <input type="radio" class="radio__input" v-model="selected" value="usage">
            <span>Расход:</span>
            <div class="checkboxes__container">
                <input type="checkbox" :disabled="selected !=='usage'" class="custom__checkbox" v-model="waterUsage"><span style="margin-left: 20px;">Воды</span>
                <br>
                <input type="checkbox" :disabled="selected !=='usage'" class="custom__checkbox" v-model="foamUsage"><span style="margin-left: 20px;">Пены</span>
            </div>
            <span>За период:</span>
            <span style="margin-left: 30px">от:</span><input type="date" class="date__input" v-model="date_begin">
            <span style="margin-left: 30px">до:</span><input type="date" class="date__input" v-model="date_end" :min="date_begin">
            <br>
            <div style="margin-top: 20px; margin-bottom: 20px;">
                <button id="submit-button" @click="showChart">Отобразить</button>
                <button id="submit-button" @click="downloadData" style="margin-left: 200px;">Скачать</button>
            </div>

            <Chart ref="chart" />

            <div style="margin-top: 20px; display: flex; justify-content: space-between;">
                <button id="submit-button" @click="saveJSON">Сохранить данные в json<br>формате</button>
                <button id="submit-button" @click="uploadJSON" style="margin-right: 80px">Загрузить данные в json<br>формате</button>
            </div>
        </div>
    </div>
</template>

<script>
import Chart from './Chart.vue';

export default {
    name: 'StatisticsComponent',
    components: {Chart},
    data(){
        return {
            selected: 'calls',
            waterUsage: true,
            foamUsage: true,
            date_begin: '',
            date_end: '',

            DBResult: {
                labels: ['2025-01-01', '2025-01-02', '2025-01-03'],
                datasets: [{
                    label: 'Вызовы',
                    data: [13, 5, 9]
                }]
            }
        }
    },
    methods: {
        showChart(){
            let labels = ['2025-01-01', '2025-01-02', '2025-01-03'];
            let datasets = [];
            if(this.selected === 'calls'){
                datasets.push(
                    {
                        label: 'Вызовы',
                        data: [13, 5, 9],
                        borderColor: '#ff0000'
                    }
                ) 
            }
            else if(this.selected === 'usage'){
                if(this.waterUsage){
                    datasets.push(
                        {
                            label: 'Расход воды',
                            data: [24, 6, 16],
                            borderColor: '#33a0fa'
                        }
                    )
                }
                if(this.foamUsage){
                    datasets.push(
                        {
                            label: 'Расход пены',
                            data: [1, 2, 8],
                            borderColor: '#808080'
                        }
                    )
                }
            } 

            this.$refs.chart.updateChart({
                    labels: labels,
                    datasets: datasets
                }
            )
        },
        downloadData(){

        },
        saveJSON(){

        },
        uploadJSON(){

        }
    }
}
</script>

<style scoped>
.statistics__container {
    background-color: white;
    width: 100%;
    margin: 24px;
    border-radius: 20px;
}

.radio__input {
    transform: scale(3);
    margin: 0 30px 30px 10px;
}

.statistics-options__container {
    margin-left: 80px;
    margin-top: 60px;
}

span {
    font-size: x-large;
}

.checkboxes__container {
    padding-left: 60px;
}

.custom__checkbox {
    transform: scale(2);
    margin-bottom: 20px;
}

.date__input {
    padding: 10px;
    font-size: x-large;
    margin-left: 10px;
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
</style>