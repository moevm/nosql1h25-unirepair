<template>
    <div class="edit-options font-settings">
        <button @click="$emit('component-change', 'addUser')" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/addUser.svg" />
            Добавить пользователя
        </button>
        <button @click="$emit('component-change', 'searchUser')" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/searchUser.svg" />
            Редактировать пользователя
        </button>
        <button @click="$emit('component-change', 'deleteUser')" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/deleteUser.svg" />
            Удалить пользователя
        </button>
        <button @click="$emit('component-change', 'downloadDeleteReport')" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/downloadDeleteReport.svg" />
            Скачать/удалить отчёт
        </button>
    </div>
</template>

<script>
export default {
    name: "AdminEditOptions"
}
</script>

<style scoped>
.edit-options {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-template-rows: repeat(2, auto);
    gap: 50px;
    place-content: center;
    width: 100%;
    max-height: 100vh;
    box-sizing: border-box;
    padding: 20px;
}

.edit-options__link {
    display: flex;
    flex-direction: column;
    align-items: center;  
    justify-content: center;
    background-color: white;
    padding: 100px;
    border-radius: 20px;
    max-width: 25vw;
    height: 40vh;
    text-decoration: none;
    color: black;
    font-size: xx-large;
    text-align: center;
    gap: 30px;
    border: none;
    cursor: pointer;
}

.edit-options__link>img {
    height: 20vw;
    width: auto;
}

.edit-options__link:hover {
    background-color: #766EBF;
}

@media (max-width: 1300px){
    .edit-options__link {
        display: flex;
        flex-direction: column;
        align-items: center;  
        justify-content: center;
        background-color: white;
        padding: 100px;
        border-radius: 20px;
        max-width: 30vw;
        height: 40vh;
        text-decoration: none;
        color: black;
        font-size: x-large;
        text-align: center;
        gap: 30px;
        border: none;
        cursor: pointer;
    }
}
</style>