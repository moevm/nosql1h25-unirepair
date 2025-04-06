<template>
    <div class="edit-options">
        <RouterLink to="edit/addUser" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/addUser.svg" />
            Добавить пользователя
        </RouterLink>
        <RouterLink to="edit/editUser" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/edit_User.svg" />
            Редактировать пользователя
        </RouterLink>
        <RouterLink to="edit/deleteUser" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/deleteUser.svg" />
            Удалить пользователя
        </RouterLink>
        <RouterLink to="edit/downloadDeleteReport" class="edit-options__link">
            <img class="sidebar__icon" src="/icons/downloadDeleteReport.svg" />
            Скачать/удалить отчёт
        </RouterLink>
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
    width: 300px;
    text-decoration: none;
    color: black;
    font-size: xx-large;
    text-align: center;
    gap: 60px;
}

.edit-options__link>img {
    height: 100px;
    width: auto;
}

.edit-options__link:hover {
    background-color: #766EBF;
}
</style>