const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const { router, setDbReady } = require('./routes');
const neo4j = require('neo4j-driver');

require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const retryConnection = async (driver, retries = 10, delay = 10_000) => {
  while (retries > 0) {
    try {
      const session = driver.session();
      await session.run('RETURN 1');
      console.log('Успешное подключение к базе данных!');
      await session.close();
      return true;
    } catch (error) {
      retries--;
      console.log(`Ошибка подключения. Повторная попытка через ${delay / 1000} секунд... (${retries} осталось)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  console.error('Не удалось подключиться к базе данных после нескольких попыток.');
  return false;
};

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}, но ожидает подключение базы...`);
});

const createDatabaseStructure = async () => {
  const session = driver.session();
  try {
    const result = await session.run(`
      CALL db.constraints() YIELD name
      WHERE name CONTAINS 'Login'
      RETURN name;
    `);

    if (result.records.length === 0) {
      await session.run(`CREATE CONSTRAINT FOR (user:User) REQUIRE user.Login IS UNIQUE;`);
      console.log('Ограничение на уникальность логина установлено.');
    } else {
      console.log('Ограничение на логин уже существует, пропускаем его создание.');
    }
  } catch (error) {
    console.error('Ошибка при создании структуры базы данных:', error);
  } finally {
    await session.close();
  }
};

const loadJSON = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const importData = async () => {
  const session = driver.session();
  try {
    const users = loadJSON('users.json');
    for (const user of users) {
      await session.run(`
        CREATE (:User:${user.role}:${user.status} {
          familyName: $familyName,
          firstName: $firstName,
          fatherName: $fatherName,
          brigadeNumber: $brigadeNumber,
          address: $address,
          phone: $phone,
          email: $email,
          login: $login,
          passwordHash: $passwordHash,
          registeredAt: $registeredAt,
          modifiedAt: $modifiedAt
        });
      `, user);
    }
    console.log('Данные пользователей загружены.');

    const callForms = loadJSON('call_forms.json');
    for (const cf of callForms) {
      await session.run(`
        CREATE (:CallForm:${cf.status} {
          createdAt: $createdAt,
          modifiedAt: $modifiedAt,
          callSource: $callSource,
          fireAddress: $fireAddress,
          bottomLeft: point($bottomLeft),
          topRight: point($topRight),
          fireType: $fireType,
          fireRank: $fireRank,
          victimsCount: $victimsCount,
          assignedTo: $assignedTo,
          auto: $auto
        });
      `, cf);
    }
    console.log('Данные о вызовах загружены.');

    const inventoryItems = loadJSON('inventory.json');
    for (const item of inventoryItems) {
      await session.run(`
        CREATE (:Inventory { name: $name });
      `, item);
    }
    console.log('Данные инвентаря загружены.');

    const reports = loadJSON('reports.json');
    for (const report of reports) {
      await session.run(`
        CREATE (:Report:${report.status} {
          waterSpent: $waterSpent,
          foamSpent: $foamSpent,
          allegedFireCause: $allegedFireCause,
          damage: $damage,
          additionalNotes: $additionalNotes,
          modifiedAt: $modifiedAt
        });
      `, report);
    }
    console.log('Данные отчётов загружены.');

    const relationships = loadJSON('relationships.json');
    for (const relation of relationships) {
      await session.run(`
        MATCH (start:${relation.startNode.label} { ${Object.keys(relation.startNode.properties).map(key => `${key}: $start_${key}`).join(', ')} }),
              (end:${relation.endNode.label} { ${Object.keys(relation.endNode.properties).map(key => `${key}: $end_${key}`).join(', ')} })
        CREATE (start)-[:${relation.relationshipType}]->(end);
      `, 
      {
        ...Object.entries(relation.startNode.properties).reduce((acc, [key, value]) => ({ ...acc, [`start_${key}`]: value }), {}),
        ...Object.entries(relation.endNode.properties).reduce((acc, [key, value]) => ({ ...acc, [`end_${key}`]: value }), {})
      });
    }
    console.log('Связи между узлами загружены.');
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
  } finally {
    await session.close();
  }
};

const initializeDatabase = async () => {
  console.log('Ожидание подключения к базе данных...');
  
  const connected = await retryConnection(driver);
  if (!connected) {
    console.error('Ошибка: база данных недоступна.');
    return;
  }

  await createDatabaseStructure();
  await importData();

  setDbReady(true);
  console.log('База данных готова! Теперь сервер начинает принимать запросы.');
};

initializeDatabase();

