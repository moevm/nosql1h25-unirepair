<template>
    <div class="chart__container">
        <canvas ref="chart"></canvas>
    </div>
</template>

<script>
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Legend } from 'chart.js';
import { shallowRef } from 'vue';

export default {
    name: 'ChartComponent',
    setup(){
        const plugin = {
            id: 'setBackgroundColor',
            beforeDraw: (chart, args, options) => {
                const {ctx} = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = options.color || '#99ffff';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };
        return {plugin};
    },
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
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        setBackgroundColor: {
                            color: 'white'
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#333',
                                font: {
                                    size: 20   
                                },
                                usePointStyle: true,
                                pointStyle: 'line',
                                padding: 20,
                                
                            }
                        }
                    }
                },
                plugins: [this.plugin]
            }));
        },
        updateChart(DBResult){
            this.chartData.labels = DBResult.labels;
            this.chartData.datasets = DBResult.datasets;
            this.chart.update();
        },
        getImageString(){
            return this.chart.toBase64Image();
        }
    }
}
</script>

<style scoped>
.chart__container {
    height: 45vh;
}
</style>