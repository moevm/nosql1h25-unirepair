const express = require('express');
const router = express.Router();
const driver = require('./db');

let dbReady = false; 

router.get('/', (req, res) => {
  res.redirect('/login'); 
});

router.get('/login', (req, res) => {
  res.send('экран входа');
});

//_________________для пожарных_____________________
router.get('/firefighterProfile', (req, res) => {
  res.send('профиль пожарного');
});

router.get('/callScreen', (req, res) => {
  res.send('экран вызова');
});

router.get('/reportScreen', (req, res) => {
  res.send('экран отчётов');
});

router.get('/reportEditor', (req, res) => {
  res.send('редактор отчётов');
});


//_________________для оператора_____________________
router.get('/operatorProfile', (req, res) => {
  res.send('профиль оператора');
});

router.get('/newForm', (req, res) => {
  res.send('новая форма');
});

router.get('/operatorReports', (req, res) => {
  res.send('отчёты оператора');
});


//_________________для админа_____________________
router.get('/adminProfile', (req, res) => {
  res.send('профиль админа');
});

router.get('/editor', (req, res) => {
  res.send('редактор для админа (все варианты доступны, но с ограничениями)');
});

router.get('/addUser', (req, res) => {
  res.send('добавить пользователя');
});

router.get('/editUser', (req, res) => {
  res.send('редактировать пользователя');
});

router.get('/deleteUser', (req, res) => {
  res.send('удалить пользователя');
});

router.get('/findDeleteReports', (req, res) => {
  res.send('найти удалить отчёты');
});

module.exports = { router, setDbReady: (ready) => { dbReady = ready; } };

