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
        adress: '',
        login: '',
        password: ''
    },
    oldLogin: null
  }),
  actions: {
    updateData(editedUser) {
        this.user.name = editedUser.name;
        this.user.surname = editedUser.surname;
        this.user.patronymic = editedUser.patronymic;
        this.user.role = editedUser.role;
        this.user.brigade = editedUser.brigade;
        this.user.phone = editedUser.phone;
        this.user.email = editedUser.email;
        this.user.adress = editedUser.adress;
        this.user.login = editedUser.login;
        this.user.password = editedUser.password;
        
        this.oldLogin = editedUser.login;
    },
  },
});