const express = require('express');
const app = express();
const PORT = 3000;
const routes = require('./routes');
const neo4j = require('neo4j-driver');

require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const retryConnection = async (driver, retries = 5) => {
  while (retries > 0) {
    try {
      const session = driver.session();
      await session.run('RETURN 1');
      console.log('Успешное подключение к базе данных');
      return;
    } catch (error) {
      retries--;
      console.log(`Ошибка подключения. Повторная попытка через 5 секунд (${retries} осталось)...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Не удалось подключиться к базе данных после нескольких попыток.');
};

const createDatabaseStructure = async () => {
  const session = driver.session();
  try {
    await session.run(`
      CREATE CONSTRAINT FOR (user:User) REQUIRE user.Login IS UNIQUE;
      CREATE CONSTRAINT FOR (inventory:Inventory) REQUIRE inventory.Name IS NOT NULL;
      CREATE CONSTRAINT FOR (report:Report) REQUIRE report.Status IS NOT NULL;
      CREATE CONSTRAINT FOR (call:CallForm) REQUIRE call.Status IS NOT NULL;
    `);
    console.log('Структура базы данных успешно создана.');
  } catch (error) {
    console.error('Ошибка при создании структуры базы данных:', error);
  } finally {
    await session.close();
  }
};

const initializeDatabase = async () => {
  try {
    await retryConnection(driver);
    await createDatabaseStructure();
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1); 
  }
};

initializeDatabase().then(() => {
  app.use('/', routes);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

