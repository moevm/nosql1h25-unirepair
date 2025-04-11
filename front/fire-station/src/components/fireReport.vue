<template>
  <div class="fireReport__container">
    <div class="report-form__container">
      <div class="form-group">
        <label>Адрес происшествия:</label>
        <input type="text" v-model="incidentAddress" class="form-input">
      </div>
<!--      карта будет позже-->
      <img src="../../public/map.png">

      <div class="form-group">
        <label>Характер пожара:</label>
        <input type="text" v-model="fireType" class="form-input">
      </div>

      <div class="form-group">
        <label>Есть пострадавшие?</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="hasCasualties" value="no"> Нет
          </label>
          <label>
            <input type="radio" v-model="hasCasualties" value="yes"> Да
          </label>
        </div>
      </div>

      <div class="form-group" v-if="hasCasualties === 'yes'">
        <label>Количество пострадавших:</label>
        <input type="number" v-model="casualtiesCount" min="1" class="form-input">
      </div>

      <div class="form-group">
        <label>Источник звонка:</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="callSource" value="witness"> Звонок очевидца
          </label>
          <label>
            <input type="radio" v-model="callSource" value="alarm"> Автоматическая сигнализация
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Ранг пожара:</label>
        <div class="radio-group">
          <label v-for="(rank, index) in fireRanks" :key="index">
            <input type="radio" v-model="fireRank" :value="rank.value"> {{ rank.label }}
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Выбор бригад:</label>
        <table class="selection-table">
          <thead>
          <tr>
            <th>Выбрать</th>
            <th>Номер бр.</th>
            <th>Размер бр.</th>
            <th>Время последнего вызова</th>
            <th>Кол-во вызовов за смену</th>
            <th>Статус</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(brigade, index) in availableBrigades" :key="index">
            <td><input type="checkbox" v-model="brigade.selected"></td>
            <td>{{ brigade.number }}</td>
            <td>{{ brigade.size }}</td>
            <td>{{ brigade.lastCallTime }}</td>
            <td>{{ brigade.callsCount }}</td>
            <td :class="{'status-available': brigade.status === 'Свободна', 'status-busy': brigade.status === 'На вызове'}">
              {{ brigade.status }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="form-group">
        <label>Выбор пожарной машины:</label>
        <table class="selection-table">
          <thead>
          <tr>
            <th>Выбрать</th>
            <th>Тип машины</th>
            <th>Статус</th>
            <th>Номер машины</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(vehicle, index) in availableVehicles" :key="index">
            <td><input type="radio" v-model="selectedVehicle" :value="vehicle.number"></td>
            <td>{{ vehicle.type }}</td>
            <td :class="{'status-available': vehicle.status === 'Свободна', 'status-busy': vehicle.status === 'Занята'}">
              {{ vehicle.status }}
            </td>
            <td>{{ vehicle.number }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="form-actions">
        <button class="send-button" @click="sendToBrigades">Отправить бригадам</button>
        <button class="save-button" @click="showSaveAlert = true">Сохранить форму</button>
      </div>
      <div v-if="showSaveAlert" class="alert__container">
        <img src="/icons/exit.svg" id="exit-icon-alert" @click="showSaveAlert = false">
        <div class="alert-message" >
          Внимание!<br>
          При сохранении форму нельзя будет редактировать.<br>
          Вы действительно хотите сохранить форму?
        </div>
        <button class="confirm-button" @click="confirmSave">Сохранить форму</button>
      </div>
    </div>
  </div>
</template>

<script>
// import { onMounted, ref } from 'vue'
// import L from 'leaflet'
export default {
  name: 'CreateFireReportComponent',

  data() {
    return {
      showSaveAlert: false,
      incidentAddress: '',
      fireType: '',
      hasCasualties: 'no',
      casualtiesCount: 0,
      callSource: 'witness',
      fireRank: '1',
      selectedBrigades: [],
      selectedVehicle: '',

      fireRanks: [
        { value: '1', label: '1' },
        { value: '1-БИС', label: '1-БИС' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' }
      ],

      availableBrigades: [
        { number: 1, size: 9, lastCallTime: '12:35 12.12.24', callsCount: 1, status: 'Свободна', selected: false },
        { number: 2, size: 5, lastCallTime: '11:35 12.12.24', callsCount: 2, status: 'Свободна', selected: false },
        { number: 4, size: 8, lastCallTime: '13:50 12.12.24', callsCount: 1, status: 'На вызове', selected: false },
        { number: 3, size: 7, lastCallTime: '13:25 12.12.24', callsCount: 3, status: 'На вызове', selected: false }
      ],

      availableVehicles: [
        { type: 'Автоцистерна (АЦ)', status: 'Свободна', number: 'A123BC' },
        { type: 'Автолестница (АЛ)', status: 'Занята', number: 'E456KL' },
        { type: 'Коленчатый подъёмник (АКП)', status: 'Свободна', number: 'M789PH' },
        { type: 'Пожарно-насосная станция (ПНС)', status: 'Свободна', number: 'T102KC' }
      ]
    }
  },
  methods: {
    sendToBrigades() {
      const selectedBrigades = this.availableBrigades.filter(b => b.selected);
      if (selectedBrigades.length === 0) {
        alert('Выберите хотя бы одну бригаду');
        return;
      }

      if (!this.selectedVehicle) {
        alert('Выберите пожарную машину');
        return;
      }

      // Здесь будет логика отправки данных выбранным бригадам
      console.log('Отправка бригадам:', {
        incidentAddress: this.incidentAddress,
        fireType: this.fireType,
        fireRank: this.fireRank,
        brigades: selectedBrigades,
        vehicle: this.selectedVehicle
      });

      alert('Информация отправлена выбранным бригадам');
    },

    confirmSave() {
      // Здесь будет логика сохранения формы
      console.log('Сохранение формы:', {
        incidentAddress: this.incidentAddress,
        fireType: this.fireType,
        hasCasualties: this.hasCasualties,
        casualtiesCount: this.casualtiesCount,
        callSource: this.callSource,
        fireRank: this.fireRank,
        selectedBrigades: this.availableBrigades.filter(b => b.selected),
        selectedVehicle: this.selectedVehicle
      });
      this.showSaveAlert = false;
      this.resetForm();

    },
    resetForm() {
      this.incidentAddress = '';
      this.fireType = '';
      this.hasCasualties = 'no';
      this.casualtiesCount = 0;
      this.callSource = 'witness';
      this.fireRank = '1';
      this.selectedBrigades = [];
      this.selectedVehicle = '';}
  }
}
</script>

<style scoped>
img{
  padding-left: 150px;
  height: 400px;
  width: 400px;
}
.report-form__container{
  width: 95%;
}
.fireReport__container {
  padding: 20px 20px 20px 0;
  margin: 0;
  background-color: #CED0E9;
  width: 100vw;
}

.component-label__container label {
  font-size: 24px;
  font-weight: bold;
}

.report-form__container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  cursor: pointer;
}

.selection-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.selection-table th, .selection-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.selection-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.selection-table tbody tr:hover {
  background-color: #f9f9f9;
}

.status-available {
  color: green;
  font-weight: bold;
}

.status-busy {
  color: red;
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.send-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
}

.send-button:hover {
  background-color: #45a049;
}

.save-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #bf6e6e;
  color: white;
}

.save-button:hover {
  background-color: #8d5151;
}

.alert__container {
  position: fixed;
  border: 5px solid #BF6E6E;
  background-color: white;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  border-radius: 13px;
  width: 60%;
  height: 40%;
  font-size: xx-large;
  font-weight: bolder;
}
#exit-icon-alert {
  position: absolute;
  cursor: pointer;
  padding: 10px;
  right: -5px;
  top: -5px;
  background-color: #BF6E6E;
  border-radius: 10px;
  width: 20px;
  height: 20px;
}

#exit-icon-alert:hover {
  background-color: #8d5151;
}
.alert-message{
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -30%);
  font-size: x-large;
}
.confirm-button {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translate(-50%, -0%);
  border: none;
  background-color: #BF6E6E;
  font-size: x-large;
  border-radius: 13px;
  width: 25%;
  height: 20%;
  cursor: pointer;
}
.confirm-button:hover {
  background-color: #8d5151;
}
</style>