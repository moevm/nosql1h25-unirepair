<template>
    <div class="layout">
        <Sidebar :role="userRole" :fullName="userName" />
        <AdminEditOptions @component-change="activeComponent = $event" v-show="activeComponent === 'menu'"/>
        
        <!--Ниже будут остальные компоненты редактирования, которые будут переключаться между собой-->
        <AddUser @component-change="activeComponent = $event" v-show="activeComponent === 'addUser'"/>
    </div>
</template>

<script>
import AddUser from '@/components/AddUser.vue';
import AdminEditOptions from '@/components/AdminEditOptions.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
    name: "AdminEditView",
    components: {Sidebar, AdminEditOptions, AddUser},
    data (){
        return {
            userRole: 'admin',
            userName: 'Величайший',
            activeComponent: 'menu'
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