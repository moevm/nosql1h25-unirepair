<template>
    <div class="layout">
        <Sidebar :role="userRole" :fullName="userName" />
        <AdminEditOptions />
    </div>
</template>

<script>
import AdminEditOptions from '@/components/AdminEditOptions.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
    name: "AdminEditView",
    components: {Sidebar, AdminEditOptions},
    data (){
        return {
            userRole: 'admin',
            userName: 'Величайший'
        }
    }
}

</script>

<style scoped>
.layout {
  display: flex;
  background-color: #CED0E9;
}
</style>