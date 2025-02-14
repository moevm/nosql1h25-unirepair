const neo4j = require('neo4j-driver');
const readlineSync = require('readline-sync');

// Очистка бд перед использованием
async function clearDatabase(session) {
  try {
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('База данных успешно очищена');
  } catch (err) {
    console.error('Ошибка при очистке базы данных:', err);
  }
}

// Запись введённых данных
async function writeData(session, message) {
  try {
    await session.run('CREATE (n:Greeting {message: $message})', { message });
    console.log('Данные записаны успешно');
  } catch (err) {
    console.error('Ошибка при записи данных:', err);
  }
}

// Чтение записанных данных
async function readData(session) {
  try {
    const result = await session.run('MATCH (n:Greeting) RETURN n.message AS message');
    result.records.forEach(record => {
      console.log('Прочитанное сообщение:', record.get('message'));
    });
  } catch (err) {
    console.error('Ошибка при чтении данных:', err);
  }
}


async function main() {
  const username = readlineSync.question('Введите логин: ');
  const password = readlineSync.question('Введите пароль: ', { hideEchoBack: true });
  const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic(username, password));
  const session = driver.session();
  const input = readlineSync.question('Введите текст для записи в базу данных: ');

  try {
    await clearDatabase(session);
    await writeData(session, input);
    await readData(session);
  } catch (err) {
    console.error('Ошибка при выполнении операций:', err);
  } finally {
    await session.close();
    await driver.close();
    console.log('Сессия и драйвер закрыты.');
  }
}

main();

