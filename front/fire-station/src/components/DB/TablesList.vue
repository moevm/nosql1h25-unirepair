<template>
    <div class="options">
        <RouterLink class="link" to="/db/users">
            Сотрудники
        </RouterLink>
        <RouterLink class="link" to="/db/callforms">
            Формы вызова
        </RouterLink>
        <RouterLink class="link" to="/db/reports">
            Отчёты
        </RouterLink>
        <RouterLink class="link" to="/db/inventory">
            Инвентарь
        </RouterLink>
    </div>    
</template>

<script>
export default {
    name: 'TablesList'
}
</script>

<style scoped>
.options {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: 50px;
    place-content: center;
    width: 100%;
}

.link {
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
    cursor: pointer;
}

.link:hover {
    background-color: #766EBF;
}
</style>