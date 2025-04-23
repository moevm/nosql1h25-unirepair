import { defineStore } from 'pinia';

export const useEditedUser = defineStore('editedUser', {
  state: () => ({
    user: {
        name: '',
        surname: '',
        patronymic: '',
        role: '',
        brigade: '',
        phone: '',
        email: '',
        address: '',
        login: '',
        password: ''
    },
    oldLogin: null
  }),
  actions: {
    updateData(editedUser, role) {
        this.user.name = editedUser.firstName;
        this.user.surname = editedUser.familyName;
        this.user.patronymic = editedUser.fatherName;
        this.user.role = role;
        this.user.brigade = editedUser.brigadeNumber > 0 ? editedUser.brigadeNumber : '';
        this.user.phone = editedUser.phone;
        this.user.email = editedUser.email;
        this.user.address = editedUser.address;
        this.user.login = editedUser.login;
        this.user.password = editedUser.password;
        
        this.oldLogin = editedUser.login;
    },
  },
});