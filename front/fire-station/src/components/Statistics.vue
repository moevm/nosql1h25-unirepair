<template>
    <div class="block">
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
                <button class="submit-button save-button" @click="exportJSON">Сохранить данные в json<br>формате</button>
                <button class="submit-button load-button" @click="triggerJSONSelection">
                    Загрузить данные в json<br>формате
                    <input type="file" style="display: none;" ref="fs" @change="onFileChange" accept=".json">
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Chart from './Chart.vue';
import range from '@/common/range';
import query from '@/common/query';

export default {
    name: 'StatisticsComponent',
    components: {Chart},
    setup(){
        const a = document.createElement('a');
        return {a}
    },
    data(){
        return {
            selected: 'calls',
            waterUsage: true,
            foamUsage: true,
            date_begin: '',
            date_end: '',
            fileName: 'Вызовы',

            statisticsData: [],
            importData: null
        }
    },
    methods: {
        async showChart(){
            let labels = [];
            let datasets = [];
            if(this.selected === 'calls'){
                await axios.get(`http://localhost:3000/api/callform_search?createdAt=${range(this.date_begin, this.date_end)}`).then(req => this.statisticsData = req.data);
                labels = [...new Set(this.statisticsData.map(r => this.formDate(r)))];
                
                let callsData = [];
                labels.forEach(label => {
                    callsData.push(this.statisticsData.filter(r => this.formDate(r) === label).length)
                })

                datasets.push(
                    {
                        label: 'Вызовы',
                        data: callsData,
                        borderColor: '#ff0000'
                    }
                ) 
                this.fileName = "Вызовы"
            }
            else if(this.selected === 'usage'){
                await axios.get(`http://localhost:3000/api/report_search?modifiedAt=${range(this.date_begin, this.date_end)}`).then(req => this.statisticsData = req.data);
                labels = [...new Set(this.statisticsData.map(r => this.formDate(r)))];

                if(this.waterUsage){
                    let waterData = [];
                    labels.forEach(label => {
                        waterData.push(this.statisticsData.filter(r => this.formDate(r) === label).reduce((acc, r) => acc + r.waterSpent, 0));
                    })

                    datasets.push(
                        {
                            label: 'Расход воды',
                            data: waterData,
                            borderColor: '#33a0fa'
                        }
                    )
                }
                if(this.foamUsage){
                    let foamData = [];
                    labels.forEach(label => {
                        foamData.push(this.statisticsData.filter(r => this.formDate(r) === label).reduce((acc, r) => acc + r.foamSpent, 0));
                    })

                    datasets.push(
                        {
                            label: 'Расход пены',
                            data: foamData,
                            borderColor: '#808080'
                        }
                    )
                }
                this.fileName = "Расход"
            } 

            this.$refs.chart.updateChart({
                    labels: labels,
                    datasets: datasets
                }
            )
        },
        downloadData(){
            this.a.href = this.$refs.chart.getImageString();
            this.a.download = `Статистика-${this.fileName}.png`
            this.a.click();
        },
        async exportJSON(){
            let bd = JSON.stringify(await query("export_data"), null, 2);

            const blob = new Blob([bd], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            this.a.href = url;
            this.a.download = "export.json"
            this.a.click();

            URL.revokeObjectURL(url);
        },
        triggerJSONSelection(){
            this.$refs.fs.click();
        },
        async onFileChange(e){
            let files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            await this.importJSON(files[0]);
            this.$refs.fs.value = '';
        },
        async importJSON(file){
            const importData = await this.readJSON(file)
            console.log(importData)

            await axios.post("http://localhost:3000/api/import_data", importData);
        },
        readJSON(file){
            return new Promise((resolve) => {
                const fr = new FileReader();
                fr.onload = e => resolve(JSON.parse(e.target.result));

                fr.readAsText(file)
            })
        },
        formDate(r){
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
    flex: 1;
}

.block {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
  position: relative;
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
    bottom: 10px;
    left: 20px;
}

.load-button {
    position: absolute;
    bottom: 10px;
    right: 20px;
}

.submit-button:not(:disabled) {
    cursor: pointer;
}

.submit-button:hover:not(:disabled) {
    background-color: #766EBF;
}

@media (max-width: 1500px) {
    .statistics__text {
        font-size: 15px;
    }
    .submit-button {
        font-size: 15px;
        font-weight: 500;
        border-radius: 8px;
        border: none;
        padding: 0.5rem 1rem;
        background-color: #A7A3CC;
        margin: 0;
    }
}
</style>