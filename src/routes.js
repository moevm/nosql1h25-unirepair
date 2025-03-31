const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Добро пожаловать! База данных успешно инициализирован.');
});

module.exports = router;

