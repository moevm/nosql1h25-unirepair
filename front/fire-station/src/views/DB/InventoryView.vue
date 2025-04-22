<template>
    <div class="layout">
        <Sidebar />
        <div class="content__container">
            <div class="table__label">
                <RouterLink id="exit-icon" to="/db">
                    <img src="/icons/exit.svg">
                </RouterLink>
                <label style="font-size: xx-large;">Инвентарь</label>
            </div>

            <div class="table-field__container">
                <div>
                    <!-- Поле для добавления нового инвентаря -->
                    <span>Добавить инвентарь:</span>
                    <input type="text" class="text__input" v-model="newInventoryName">
                    <button @click="addInventory" class="submit-button">Добавить</button>
                    <br>
                    
                    <!-- Поле для поиска существующего инвентаря -->
                    <span>Поиск инвентаря:</span>
                    <input type="text" class="text__input" v-model="searchName">
                    <button @click="search" class="submit-button">Найти</button>
                    <button @click="reset" class="submit-button" style="margin-left: 10px;">Сбросить</button>
                </div>

                <div class="table__container">
                    <table>
                        <thead style="position: sticky; top: 0; background-color: white; border: 1px solid black;">
                            <tr>
                                <th>Наименование инвентаря</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(inventory, index) in foundInventory" :key="index">
                                <td>{{ inventory.name }}</td>
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
    name: 'InventoryView',
    components: { Sidebar },
    data(){
        return {
            newInventoryName: '', 
            searchName: '',      
            foundInventory: []   
        }
    },
    methods: {
        async search(){
            await axios.get(`http://localhost:3000/api/inventory_search?${this.stringifySearchParams()}`)
                .then(res => this.foundInventory = res.data);
        },
        
        async addInventory() {
            const name = this.newInventoryName.trim();
            
            if (!name) {
                alert('Введите название инвентаря');
                return;
            }

            try {
                const url = `http://localhost:3000/api/inventory_add?name=${encodeURIComponent(name)}`;
                
                const response = await axios.get(url);
                
                if (response.data.success) {
                this.newInventoryName = '';
                this.search();
                } else {
                alert(response.data.message || 'Ошибка при добавлении');
                }
            } catch (error) {
                console.error('Полная ошибка:', error);
                if (error.response) {
                alert(error.response.data?.message || 'Ошибка сервера');
                } else {
                alert('Не удалось подключиться к серверу');
                }
            }
        },
        
        stringifySearchParams(){
            let params = {
                name: this.searchName
            }

            params = new URLSearchParams(Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== ';')
            )).toString();

            return params;
        },
        
        reset(){
            this.searchName = '';
            this.search();
        }
    }
}
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}

.submit-button {
    cursor: pointer;
    font-size: x-large;
    border-radius: 10px;
    border: none;
    padding: 10px 20px 10px 20px;
    background-color: #A7A3CC;
}

.submit-button:hover {
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
    width: 15%;
    max-height: 548px;
    margin-top: 10px;
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