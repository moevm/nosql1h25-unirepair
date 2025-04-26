<template>
    <div class="statistics__container">
        <input type="radio" class="radio__input" v-model="selected" value="calls">
        <span class="statistics__text text__choice">Вызовы</span>
        <br>
        <input type="radio" class="radio__input" v-model="selected" value="usage">
        <span class="statistics__text text__choice">Расход:</span>
        <div class="checkboxes__container">
            <input type="checkbox" :disabled="selected !=='usage'" class="custom__checkbox" v-model="waterUsage"><span class="statistics__text text__choice">Воды</span>
            <br>
            <input type="checkbox" :disabled="selected !=='usage'" class="custom__checkbox" v-model="foamUsage"><span class="statistics__text text__choice">Пены</span>
        </div>
        <span class="statistics__text">За период:</span>
        <span class="statistics__text text__date">от:</span><input type="date" class="date__input" v-model="date_begin">
        <span class="statistics__text text__date">до:</span><input type="date" class="date__input" v-model="date_end" :min="date_begin">
        <br>
        <div class="chart-buttons">
            <button class="submit-button" @click="showChart">Отобразить</button>
            <button class="submit-button" @click="downloadData" style="margin-left: 200px;">Скачать</button>
        </div>

        <Chart ref="chart" />

        <div class="profile__buttons">
            <button class="submit-button save-button" @click="saveJSON">Сохранить данные в json<br>формате</button>
            <button class="submit-button load-button" @click="uploadJSON">Загрузить данные в json<br>формате</button>
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
    position: relative;
    box-sizing: border-box;
    margin: 24px;
    min-width: 70vw;
    width: 100%;
    min-height: 90vh;
    background: #fff;
    padding: 46px 50px;
    border-radius: 13px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.statistics__text {
  font-size: 20px;
}

.radio__input {
    transform: scale(2);
    margin-bottom: 20px;
}

.checkboxes__container {
    padding-left: 35px;
}

.text__choice {
  padding-left: 15px;
}

.custom__checkbox {
    transform: scale(150%);
    margin-bottom: 20px;
}

.date__input {
    padding: 6px;
    font-size: x-large;
    margin-left: 10px;
}

.text__date {
  padding-left: 25px;
}

.profile__buttons {
    display: flex;
    justify-content: space-between;
}

.submit-button {
    font-size: 20px;
    font-weight: 500;
    border-radius: 8px;
    border: none;
    padding: 0.5rem 1rem;
    background-color: #A7A3CC;
    margin: 0;
}

.chart-buttons {
    margin: 18px 0 4px;
}

.save-button {
    position: absolute;
    bottom: 20px;
    left: 20px;
}

.load-button {
    position: absolute;
    bottom: 20px;
    right: 20px;
}

.submit-button:not(:disabled) {
    cursor: pointer;
}

.submit-button:hover:not(:disabled) {
    background-color: #766EBF;
}
</style>