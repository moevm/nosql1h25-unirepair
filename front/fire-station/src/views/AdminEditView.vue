<template>
    <div class="layout">
        <Sidebar />
        <AdminEditOptions @component-change="activeComponent = $event" v-show="activeComponent === 'menu'"/>
        
        <!--Ниже будут остальные компоненты редактирования, которые будут переключаться между собой-->
        <AddUser @component-change="activeComponent = $event" v-show="activeComponent === 'addUser'"/>
        <SearchUser @component-change="activeComponent = $event" v-show="activeComponent === 'searchUser'" />
        <EditUser @component-change="activeComponent = $event" v-show="activeComponent === 'editUser'" />
        <DeleteUser @component-change="activeComponent = $event" v-show="activeComponent === 'deleteUser'" />
        <DownloadDeleteReport @component-change="activeComponent = $event" v-show="activeComponent === 'downloadDeleteReport'" />
    </div>
</template>

<script>
import AddUser from '@/components/AddUser.vue';
import AdminEditOptions from '@/components/AdminEditOptions.vue';
import DeleteUser from '@/components/deleteUser.vue';
import DownloadDeleteReport from '@/components/DownloadDeleteReport.vue';
import EditUser from '@/components/EditUser.vue';
import SearchUser from '@/components/SearchUser.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
    name: "AdminEditView",
    components: {Sidebar, AdminEditOptions, AddUser, SearchUser, EditUser, DeleteUser, DownloadDeleteReport},
    data (){
        return {
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