<template>
    <div class="edit-options">
        <button @click="$emit('component-change', 'addUser')" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/addUser.svg" />
            Добавить пользователя
        </button>
        <button @click="$emit('component-change', 'editUser')" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/edit_User.svg" />
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
    gap: 50px;
    place-content: center;
    width: 100%;
}

.edit-options__link {
    display: flex;
    flex-direction: column;
    align-items: center;  
    background-color: white;
    padding: 60px;
    border-radius: 20px;
    width: 450px;
    text-decoration: none;
    color: black;
    font-size: xx-large;
    text-align: center;
    gap: 60px;
    border: none;
}

.edit-options__link>img {
    height: 100px;
    width: auto;
}

.edit-options__link:hover {
    background-color: #766EBF;
}
</style>