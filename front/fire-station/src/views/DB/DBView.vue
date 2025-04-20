<template>
    <div class="layout">
        <Sidebar />
        <TablesList />
    </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';
import TablesList from '@/components/DB/TablesList.vue';

export default {
    name: 'DBView',
    components: { Sidebar, TablesList}
}
</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}
</style>