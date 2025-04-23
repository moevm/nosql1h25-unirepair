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
            <input type="radio" v-model="callSource" value="телефонный звонок">телефонный звонок</label>
          <label>
            <input type="radio" v-model="callSource" value="автоматическая система">автоматическая система</label>
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
import axios from 'axios';
export default {
  name: 'CreateFireReportComponent',

  data() {
    return {
      showSaveAlert: false,
      incidentAddress: '',
      fireType: '',
      hasCasualties: 'no',
      casualtiesCount: 0,
      callSource: 'телефонный звонок',
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

      availableBrigades: [],
      availableVehicles: []
    }
  },
  async created() {
    await this.fetchAvailableBrigades();
    await this.fetchAvailableVehicles();
  },
  methods: {

    async fetchAvailableBrigades() {
      try {
        const response = await axios.get('http://localhost:3000/api/get_brigades');

        console.log('Полученные данные о бригадах:', response.data);

        const brigadeInfo = await Promise.all(
            response.data.freeBrigades.concat(response.data.busyBrigades).map(async brigade => {
              const membersResponse = await axios.get('http://localhost:3000/api/brigade_members', {
                params: { brigadeNumber: brigade.brigadeNumber }
              });

        const lastCallResponse = await axios.get('http://localhost:3000/api/callform_search', {
                params: {
                  assignedTo: brigade.brigadeNumber,
                  status: 'Complete',
                }
              });
              const lastCallTime = lastCallResponse.data[0]?.modifiedAt
                  ? this.neo4jDateToTime(lastCallResponse.data[0].modifiedAt)
                  : 0;

              return {
                brigadeNumber: brigade.brigadeNumber,
                size: membersResponse.data.length,
                lastCallTime: lastCallTime
              };
            })
        );
        this.availableBrigades = this.formatBrigadeData(response.data, brigadeInfo);

      } catch (error) {
        console.error('Ошибка при получении бригад:', error);
        this.error = this.getErrorMessage(error);
      } finally {
      }
    },

    formatBrigadeData(data, brigadeInfo) {
      const getInfo = (brigadeNumber) => {
        const info = brigadeInfo.find(b => b.brigadeNumber === brigadeNumber);
        return info || { size: 0, lastCallTime: 0 };
      };

      const freeBrigades = data.freeBrigades?.map(brigade => ({
        number: brigade.brigadeNumber || 0,
        size: getInfo(brigade.brigadeNumber).size || 0,
        lastCallTime: getInfo(brigade.brigadeNumber).lastCallTime,
        callsCount: 0,
        status: 'Свободна',
        selected: false
      })) || [];

      const busyBrigades = data.busyBrigades?.map(brigade => ({
        number: brigade.brigadeNumber  || 0,
        size: getInfo(brigade.brigadeNumber).size || 0,
        lastCallTime: getInfo(brigade.brigadeNumber).lastCallTime,
        callsCount: 0,
        status: 'На вызове',
        selected: false
      })) || [];

      return [...freeBrigades, ...busyBrigades].sort((a, b) => a.number - b.number);
    },
    getErrorMessage(error) {
      if (error.response) {
        return `Ошибка сервера: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        return 'Нет ответа от сервера';
      } else {
        return `Ошибка запроса: ${error.message}`;
      }
    },

    neo4jDateToTime(neo4jDate) {
      if (!neo4jDate || !neo4jDate.year) return 0;
      return new Date(
          neo4jDate.year.low,
          neo4jDate.month.low,
          neo4jDate.day.low,
          neo4jDate.hour.low,
          neo4jDate.minute.low,
          neo4jDate.second.low
      ).toLocaleString()
    },

    async fetchAvailableVehicles() {
      try {
        const response = await axios.get('http://localhost:3000/api/inventory_search');
        console.log( response.data);

        const vehicles = response.data.filter(item =>
            item.labels.includes('Inventory') &&
            item.name.includes('машина')
        );
        this.availableVehicles = await Promise.all(
            vehicles.map(async vehicle => {
              try {
                const stateResponse = await axios.get('http://localhost:3000/api/auto_state', {
                  params: {
                    auto: vehicle.id
                  }
                });

                return {
                  id: vehicle.id,
                  type: vehicle.name.split(/\s\d+$/)[0] || 'Пожарная машина',
                  number: vehicle.name.match(/\d+$/)?.[0] || 'н/д',
                  status: stateResponse.data.occupied ? 'На вызове' : 'Доступна',
                  selected: false
                };
              } catch (error) {
                console.error(`Ошибка получения статуса для машины ${vehicle.id}:`, error);
                return {
                  id: vehicle.id,
                  type: vehicle.name.split(/\s\d+$/)[0] || 'Пожарная машина',
                  number: vehicle.name.match(/\d+$/)?.[0] || 'н/д',
                  status: 'Статус неизвестен',
                  selected: false
                };
              }
            })
        );
      } catch (error) {
        console.error('Ошибка загрузки транспорта:', error.response?.data || error.message);
        this.availableVehicles = [];
      }
    },

    getSelectedBrigades() {
      return this.availableBrigades
          .filter(brigade => brigade.selected)
          .map(brigade => brigade.number);
    },

    async sendToBrigades() {
      if (!this.incidentAddress) {
        alert('Укажите адрес происшествия');
        return false;
      }

      const selectedBrigades = this.getSelectedBrigades();
      if (selectedBrigades.length === 0) {
        alert('Выберите хотя бы одну бригаду!');
        return false;
      }

      try {
        const params = {
          callSource: this.callSource,
          fireAddress: this.incidentAddress,
          fireType: this.fireType,
          fireRank: this.fireRank,
          victimsCount: this.hasCasualties === 'yes' ? this.casualtiesCount : 0,
          assignedTo: selectedBrigades[0],
          auto: "Пожарная машина "+this.selectedVehicle,
          bottomLeft: '55.7558;37.6173',
          topRight: '55.756;37.618'
        };

        console.log('Отправляемые параметры:', params);

        const response = await axios.get('http://localhost:3000/api/create_callform', {
          params: params,
          paramsSerializer: params => {
            return Object.entries(params)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');
          }
        });
        console.log('Ответ сервера:', response.data);
        // this.resetForm();
        return true;
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        alert('Произошла ошибка: ' + (error.response?.data?.error || error.message));
        return false;
      }
    },

    async confirmSave() {
      try {
        const searchParams = {
          status: 'Incomplete',
          fireAddress: this.incidentAddress,
          assignedTo: this.getSelectedBrigades()[0],
          fireType: this.fireType,
          fireRank: this.fireRank,
          victimsCount: this.hasCasualties === 'yes' ? this.casualtiesCount : 0,
          callSource: this.callSource
        };

        const searchResponse = await axios.get('http://localhost:3000/api/callform_search', {
          params: searchParams,
          paramsSerializer: params => {
            return Object.entries(params)
                .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
                .join('&');
          }
        });
        console.log('data', searchResponse.data);

        const targetCall = searchResponse.data[0];


        const paramsForCompletion = {
          status: targetCall.status,
          fireAddress: targetCall.fireAddress,
          assignedTo: targetCall.assignedTo,
          fireType: targetCall.fireType,
          fireRank: targetCall.fireRank,
          victimsCount: targetCall.victimsCount,
          callSource: targetCall.callSource,
          createdAt: targetCall.createdAt,
          modifiedAt: targetCall.modifiedAt
        };

        console.log(paramsForCompletion)

        const completeResponse = await axios.get(
            'http://localhost:3000/api/complete_callform_and_create_report',
            {
              params: paramsForCompletion,
              paramsSerializer: params => {
                return Object.entries(params)
                    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
                    .join('&');
              }
            }
        );

        console.log("completeResponse", completeResponse)

        if (completeResponse.data.success) {
          alert('Вызов успешно завершен и отчет создан!');
          this.$emit('completed');
          return true;
        } else {
          throw new Error(completeResponse.data.message || 'Не удалось завершить вызов');
        }
      } catch (error) {
        console.error('Ошибка завершения вызова:', error);
        alert(`Ошибка: ${error.message}`);
        return false;
      }
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
