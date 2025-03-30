const express = require('express');
const neo4j = require('neo4j-driver');
const router = express.Router();

// подключение к бд
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

router.get('/', async (req, res) => {
  try {
    await retryConnection(driver);

    const session = driver.session();

    try {
      await session.run(
        `CREATE (n:Person {name: $name, age: $age}) RETURN n`,
        { name: 'Oleg', age: 25 }
      );

      const result = await session.run(
        `MATCH (n:Person {name: $name}) RETURN n.age AS age`,
        { name: 'Oleg' }
      );

      const age = result.records[0].get('age');

      res.send(`Welcome to the Home Page! Возраст "Oleg": ${age}`);
    } catch (error) {
      console.error('Ошибка при работе с базой:', error);
      res.status(500).send('Ошибка при работе с базой данных');
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Критическая ошибка подключения к базе данных:', error.message);
    res.status(500).send('Не удалось подключиться к базе данных.');
  }
});

module.exports = router;

