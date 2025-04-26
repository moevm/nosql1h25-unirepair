<template>
    <div class="fireReport__container">
        <div class="report-form__container">
            <div class="form-group">
                <label>Адрес происшествия:</label>
                <input
                    type="text"
                    v-model="incidentAddress"
                    class="form-input"
                />
            </div>
            <!--      карта будет позже-->
            <img src="../../public/map.png" />

            <div class="form-group">
                <label>Характер пожара:</label>
                <input type="text" v-model="fireType" class="form-input" />
            </div>

            <div class="form-group">
                <label>Есть пострадавшие?</label>
                <div class="radio-group">
                    <label>
                        <input
                            type="radio"
                            v-model="hasCasualties"
                            value="no"
                        />
                        Нет
                    </label>
                    <label>
                        <input
                            type="radio"
                            v-model="hasCasualties"
                            value="yes"
                        />
                        Да
                    </label>
                </div>
            </div>

            <div class="form-group" v-if="hasCasualties === 'yes'">
                <label>Количество пострадавших:</label>
                <input
                    type="number"
                    v-model="casualtiesCount"
                    min="1"
                    class="form-input"
                />
            </div>

            <div class="form-group">
                <label>Источник звонка:</label>
                <div class="radio-group">
                    <label>
                        <input
                            type="radio"
                            v-model="callSource"
                            value="телефонный звонок"
                        />телефонный звонок</label
                    >
                    <label>
                        <input
                            type="radio"
                            v-model="callSource"
                            value="автоматическая система"
                        />автоматическая система</label
                    >
                </div>
            </div>

            <div class="form-group">
                <label>Ранг пожара:</label>
                <div class="radio-group">
                    <label v-for="(rank, index) in fireRanks" :key="index">
                        <input
                            type="radio"
                            v-model="fireRank"
                            :value="rank.value"
                        />
                        {{ rank.label }}
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
                        <tr
                            v-for="(brigade, index) in availableBrigades"
                            :key="index"
                        >
                            <td>
                                <input
                                    type="radio"
                                    v-model="selectedBrigade"
                                    :value="brigade.number"
                                />
                            </td>
                            <td>{{ brigade.number }}</td>
                            <td>{{ brigade.size }}</td>
                            <td>{{ brigade.lastCallTime }}</td>
                            <td>{{ brigade.callsCount }}</td>
                            <td
                                :class="{
                                    'status-available':
                                        brigade.status === 'Свободна',
                                    'status-busy':
                                        brigade.status === 'На вызове',
                                }"
                            >
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
                        <tr
                            v-for="(vehicle, index) in availableVehicles"
                            :key="index"
                        >
                            <td>
                                <input
                                    type="radio"
                                    v-model="selectedVehicle"
                                    :value="vehicle.number"
                                />
                            </td>
                            <td>{{ vehicle.type }}</td>
                            <td
                                :class="{
                                    'status-available':
                                        vehicle.status === 'Свободна',
                                    'status-busy': vehicle.status === 'Занята',
                                }"
                            >
                                {{ vehicle.status }}
                            </td>
                            <td>{{ vehicle.number }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="form-actions">
                <button class="send-button" @click="sendToBrigades">
                    Отправить бригадам
                </button>
                <button class="save-button" @click="showSaveAlert = true">
                    Сохранить форму
                </button>
            </div>
            <div v-if="showSaveAlert" class="alert__container">
                <img
                    src="/icons/exit.svg"
                    id="exit-icon-alert"
                    @click="showSaveAlert = false"
                />
                <div class="alert-message">
                    Внимание!<br />
                    При сохранении форму нельзя будет редактировать.<br />
                    Вы действительно хотите сохранить форму?
                </div>
                <button class="confirm-button" @click="confirmSave">
                    Сохранить форму
                </button>
            </div>
        </div>
    </div>
</template>

<script>
// import { onMounted, ref } from 'vue'
// import L from 'leaflet'
import query from "../common/query.js";

export default {
    name: "CreateFireReportComponent",

    data() {
        return {
            showSaveAlert: false,
            incidentAddress: "",
            fireType: "",
            hasCasualties: "no",
            casualtiesCount: 0,
            callSource: "телефонный звонок",
            fireRank: "1",
            selectedBrigade: null,
            selectedVehicle: "",

            fireRanks: [
                { value: "1", label: "1" },
                { value: "1-БИС", label: "1-БИС" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
            ],

            availableBrigades: [],
            availableVehicles: [],
            createdFormData: null,
            createdFormDates: null,
        };
    },
    async created() {
        await this.fetchAvailableBrigades();
        await this.fetchAvailableVehicles();
    },
    methods: {
        async fetchAvailableBrigades() {
            try {
                const response = await query("get_brigades");
                if (response === null) return;

                // Собираем все уникальные номера бригад
                const allBrigadeNumbers = [
                    ...new Set([
                        ...response.freeBrigades.map((b) => b.brigadeNumber),
                        ...response.busyBrigades.map((b) => b.brigadeNumber),
                    ]),
                ];

                const brigadeInfo = await Promise.all(
                    allBrigadeNumbers.map(async (brigadeNumber) => {
                        const [membersResponse, lastCallResponse] =
                            await Promise.all([
                                query("brigade_members", { brigadeNumber }),
                                query("callform_search", {
                                    assignedTo: brigadeNumber,
                                    status: "Complete",
                                }),
                            ]);

                        const lastCallTime =
                            lastCallResponse[0]?.modifiedAt ?? "Нет данных";

                        return {
                            brigadeNumber,
                            size: membersResponse.length,
                            lastCallTime,
                        };
                    }),
                );

                this.availableBrigades = this.formatBrigadeData(
                    response,
                    brigadeInfo,
                );
            } catch (error) {
                console.error("Ошибка при получении бригад:", error);
                this.error = this.getErrorMessage(error);
            }
        },

        formatBrigadeData(data, brigadeInfo) {
            const getInfo = (brigadeNumber) => {
                const info = brigadeInfo.find(
                    (b) => b.brigadeNumber === brigadeNumber,
                );
                return info || { size: 0, lastCallTime: 0 };
            };

            // Создаем Map для хранения уникальных бригад
            const brigadeMap = new Map();

            // Обрабатываем свободные бригады
            data.freeBrigades?.forEach((brigade) => {
                if (!brigadeMap.has(brigade.brigadeNumber)) {
                    brigadeMap.set(brigade.brigadeNumber, {
                        number: brigade.brigadeNumber || 0,
                        size: getInfo(brigade.brigadeNumber).size || 0,
                        lastCallTime: getInfo(brigade.brigadeNumber)
                            .lastCallTime,
                        callsCount: 0,
                        status: "Свободна",
                    });
                }
            });

            // Обрабатываем занятые бригады
            data.busyBrigades?.forEach((brigade) => {
                if (!brigadeMap.has(brigade.brigadeNumber)) {
                    brigadeMap.set(brigade.brigadeNumber, {
                        number: brigade.brigadeNumber || 0,
                        size: getInfo(brigade.brigadeNumber).size || 0,
                        lastCallTime: getInfo(brigade.brigadeNumber)
                            .lastCallTime,
                        callsCount: 0,
                        status: "На вызове",
                    });
                }
            });

            // Преобразуем Map обратно в массив и сортируем
            return Array.from(brigadeMap.values()).sort(
                (a, b) => a.number - b.number,
            );
        },

        getErrorMessage(error) {
            if (error.response) {
                return `Ошибка сервера: ${error.response.status} ${error.response.statusText}`;
            } else if (error.request) {
                return "Нет ответа от сервера";
            } else {
                return `Ошибка запроса: ${error.message}`;
            }
        },

        async fetchAvailableVehicles() {
            try {
                const response = await query("inventory_search");
                if (response === null) return;
                const vehicles = response.filter(
                    (item) =>
                        item.labels.includes("Inventory") &&
                        item.name.includes("машина"),
                );
                this.availableVehicles = await Promise.all(
                    vehicles.map(async (vehicle) => {
                        try {
                            const stateResponse = await query("auto_state", {
                                auto: vehicle.id,
                            });
                            if (stateResponse === null) return;

                            return {
                                id: vehicle.id,
                                type:
                                    vehicle.name.split(/\s\d+$/)[0] ||
                                    "Пожарная машина",
                                number:
                                    vehicle.name.match(/\d+$/)?.[0] || "н/д",
                                status: stateResponse.occupied
                                    ? "На вызове"
                                    : "Доступна",
                                selected: false,
                            };
                        } catch (error) {
                            console.error(
                                `Ошибка получения статуса для машины ${vehicle.id}:`,
                                error,
                            );
                            return {
                                id: vehicle.id,
                                type:
                                    vehicle.name.split(/\s\d+$/)[0] ||
                                    "Пожарная машина",
                                number:
                                    vehicle.name.match(/\d+$/)?.[0] || "н/д",
                                status: "Статус неизвестен",
                                selected: false,
                            };
                        }
                    }),
                );
            } catch (error) {
                console.error(
                    "Ошибка загрузки транспорта:",
                    error.response?.data || error.message,
                );
                this.availableVehicles = [];
            }
        },

        async sendToBrigades() {
            try {
                const response = await query("create_callform", {
                    login: "<userhook> operator who creates it",
                    callSource: this.callSource,
                    fireAddress: this.incidentAddress,
                    fireType: this.fireType,
                    fireRank: this.fireRank,
                    victimsCount:
                        this.hasCasualties === "yes" ? this.casualtiesCount : 0,
                    assignedTo: this.selectedBrigade,
                    auto: "Пожарная машина " + this.selectedVehicle,
                    bottomLeft: "55.7558;37.6173",
                    topRight: "55.756;37.618",
                });
                if (response === null) return;

                this.createdFormData = response;
                alert("Форма успешно создана!");
                return true;
            } catch (error) {
                console.error("Ошибка:", error);
                alert("Ошибка при создании формы: " + error.message);
                return false;
            }
        },

        async confirmSave() {
            if (!this.createdFormData) {
                alert("Сначала создайте форму!");
                return;
            }

            console.log(typeof this.createdFormData.createdAt);
            try {
                await query("complete_callform", {
                    callformId: this.createdFormData.id,
                });
                const response = await query("new_report", {
                    callformId: this.createdFormData.id,
                });
                if (response) {
                    alert("форма успешно завершена!");
                    this.resetForm();
                }
            } catch (error) {
                console.error("ошибка:", error);
                alert(`ошибка завершения формы: ${error.message}`);
            }
        },

        resetForm() {
            this.incidentAddress = "";
            this.fireType = "";
            this.hasCasualties = "no";
            this.casualtiesCount = 0;
            this.callSource = "телефонный звонок";
            this.fireRank = "1";
            this.selectedBrigade = null;
            this.selectedVehicle = "";
            this.createdFormData = null;
            this.createdFormDates = null;
            this.showSaveAlert = false;
        },
    },
};
</script>

<style scoped>
img {
    padding-left: 150px;
    height: 400px;
    width: 400px;
}
.report-form__container {
    width: 95%;
}
.fireReport__container {
    padding: 20px 20px 20px 0;
    margin: 0;
    background-color: #ced0e9;
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

.selection-table th,
.selection-table td {
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
    background-color: #4caf50;
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
    border: 5px solid #bf6e6e;
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
    background-color: #bf6e6e;
    border-radius: 10px;
    width: 20px;
    height: 20px;
}

#exit-icon-alert:hover {
    background-color: #8d5151;
}
.alert-message {
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
    background-color: #bf6e6e;
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
