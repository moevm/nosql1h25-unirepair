const express = require('express');
const app = express();
const PORT = 3000;

const routes = require('./routes');

//для обработки переменных окружения
require('dotenv').config();

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

