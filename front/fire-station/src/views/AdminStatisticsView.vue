<template>
    <div class="layout">
        <Sidebar/>
        <Statistics />
    </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';
import Statistics from '@/components/Statistics.vue';

export default {
    name: 'AdminStatisticsView',
    components: {Sidebar, Statistics}
}
</script>

<style scoped>
.layout {
    display: flex;
    background-color: #CED0E9;
}
</style>