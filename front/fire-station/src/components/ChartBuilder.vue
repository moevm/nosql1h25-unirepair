<template>
  <div class="chart__container">
    <label>Ось X:</label>
    <select v-model="xAxis" class="text">
      <option disabled value="">Выберите параметр</option>
      <option v-for="option in xOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <label>Ось Y:</label>
    <select v-model="yAxis" class="text">
      <option disabled value="">Выберите параметр</option>
      <option v-for="option in yOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <button class="btn" @click="drawChart" :disabled="!data.length || !xAxis || !yAxis">Построить график</button>
    <button @click="hideChart" class="btn" style="margin-left: 10px" v-if="showChart">Скрыть график</button>

    <canvas id="customChart" v-if="showChart && xAxis && yAxis"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'ChartBuilder',
  props: {
    data: Array,
    xOptions: Array,
    yOptions: Array,
    labels: Object,
    getStatus: Function,
  },
  data() {
    return {
      xAxis: '',
      yAxis: '',
      chart: null,
      showChart: false,
    };
  },
  methods: {
    drawChart() {
      this.showChart = true;
      if (this.showChart) {
        this.$nextTick(this.buildChart);
      }
    },
    hideChart() {
      this.showChart = false;
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
    },
    buildChart() {
      if (!this.xAxis || !this.yAxis) return;
      const grouped = {};

      for (const item of this.data) {
        let key;

        if ((this.xAxis === 'status' || this.xAxis === 'role') && this.getStatus) {
          key = this.getStatus(item);
        } else {
          key = item[this.xAxis];
        }
        if (this.labels && this.labels[key]) {
          key = this.labels[key];
        } else if (this.xAxis === 'modifiedAt') {
          key = key?.slice(0, 10);
        }

        if (!grouped[key]) grouped[key] = [];

        grouped[key].push(item);
      }

      const labels = Object.keys(grouped);
      const values = labels.map(label => {
        const group = grouped[label];
        if (this.yAxis === 'count') {
          return group.length;
        } else {
          // Сумма по числовому полю
          return group.reduce((sum, item) => {
            const val = item[this.yAxis];
            return typeof val === 'number' ? sum + val : sum;
          }, 0);
        }
      });

      if (this.chart) this.chart.destroy();

      const ctx = document.getElementById('customChart').getContext('2d');
      const xLabel = this.xOptions.find(opt => opt.value === this.xAxis)?.label;
      const yLabel = this.yOptions.find(opt => opt.value === this.yAxis)?.label;
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: `${yLabel} - ${xLabel}`,
            data: values,
            backgroundColor: 'rgb(118,110,191, 0.5)',
            borderColor: 'rgba(72,69,131,0.7)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { display: true, text: xLabel }
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: yLabel }
            }
          }
        }
      });
    }
  },
};
</script>

<style scoped>
#customChart {
  margin-top: 15px;
  max-width: 90%;
}

.chart__container {
  font-size: large;
  margin-bottom: 10px;
}

.text {
  margin-right: 8px;
}

.btn {
  cursor: pointer;
  font-size: large;
  border-radius: 10px;
  border: none;
  padding: 7px 12px;
  background-color: #a7a3cc;
}

.btn:hover {
  background-color: #766ebf;
}
</style>