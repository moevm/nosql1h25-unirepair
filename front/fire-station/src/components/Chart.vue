<template>
    <div class="chart__container">
        <canvas ref="chart" width="400" height="110"></canvas>
    </div>
</template>

<script>
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend } from 'chart.js';
import { shallowRef } from 'vue';

export default {
    name: 'ChartComponent',
    data(){
        return {
            chart: null,
            chartData: {
                labels: ['-'],
                datasets: [{
                    label: 'Статистика',
                    data: []
                }]
            }
        }
    },
    mounted() {
        this.initChart();
    },
    methods: {
        initChart() {
            Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend);
            this.chart = shallowRef(new Chart(this.$refs.chart, {
                type: 'line',
                data: this.chartData,
                options: {
                    plugins: {
                        legend: {
                            display: true, // Явно включите отображение
                            position: 'top',
                            labels: {
                                color: '#333', // Укажите цвет текста
                                font: {
                                    size: 20    // Размер шрифта
                                },
                                usePointStyle: true,
                                pointStyle: 'line',
                                padding: 20,
                                
                            }
                        }
                    }
                }
            }));
        },
        updateChart(DBResult){
            this.chartData.labels = DBResult.labels;
            this.chartData.datasets = DBResult.datasets;
            this.chart.update();
        }
    }
}
</script>

<style>
.chart__container {
    padding-right: 80px;
}
</style>