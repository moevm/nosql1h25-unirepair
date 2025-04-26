import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import driver from "./db.js";
import { apiRouter, router, setDbReady } from "./routes.js";
import generateData from "./generateData.js";
import { props } from "./query.js";
import { runApiTests } from "./tests/api_tests.js";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
const PORT = 3000;
const __dirname = path.resolve();

dotenv.config();

const retryConnection = async (driver, retries = 10, delay = 5_000) => {
  while (retries > 0) {
    try {
      const session = driver.session();
      await session.run("RETURN 1");
      console.log("Успешное подключение к базе данных!");
      await session.close();
      return true;
    } catch (error) {
      retries--;
      console.log(
        `Ошибка подключения. Повторная попытка через ${delay / 1000} секунд... (${retries} осталось)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  console.error(
    "Не удалось подключиться к базе данных после нескольких попыток.",
  );
  return false;
};

app.use("/", router);

app.listen(PORT, () => {
  console.log(
    `Сервер запущен на http://localhost:${PORT}, но ожидает подключение базы...`,
  );
});

const createDatabaseStructure = async () => {
  const session = driver.session();
  try {
    const uniques = ["User:login", "Inventory:name"];
    for (const u of uniques) {
      const [label, prop] = u.split(":");
      const name = `${label}_${prop}_constraint`;
      await session.run(
        `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${label}) REQUIRE n.${prop} IS UNIQUE;`,
      );
    }
    console.log("Ограничения на уникальность установлены.");
  } catch (error) {
    console.error("Ошибка при создании структуры базы данных:", error);
  } finally {
    await session.close();
  }
};

const loadJSON = (filename) => {
  const filePath = path.join(__dirname, "src", "data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const clearDB = async () => {
  const session = driver.session();
  try {
    await session.run("MATCH (n) DETACH DELETE n;");
    console.log("База данных очищена.");
  } catch (error) {
    console.error("Ошибка при очистке данных: ", error);
  } finally {
    await session.close();
  }
};

const importData = async () => {
  const session = driver.session();
  try {
    generateData(5, 5, 2, 10, 10, 10);
    const users = loadJSON("users.json");
    for (const user of users) {
      await session.run(
        `
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
          registeredAt: datetime($registeredAt),
          modifiedAt: datetime($modifiedAt)
        });
      `,
        user,
      );
    }

    const callForms = loadJSON("call_forms.json");
    for (const cf of callForms) {
      await session.run(
        `
        CREATE (:CallForm:${cf.status} {
          createdAt: datetime($createdAt),
          modifiedAt: datetime($modifiedAt),
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
      `,
        cf,
      );
    }

    const inventoryItems = loadJSON("inventory.json");
    for (const item of inventoryItems) {
      await session.run(
        `
        CREATE (:Inventory { name: $name });
      `,
        item,
      );
    }

    const reports = loadJSON("reports.json");
    for (const report of reports) {
      await session.run(
        `
        CREATE (:Report:${report.status} {
          waterSpent: $waterSpent,
          foamSpent: $foamSpent,
          allegedFireCause: $allegedFireCause,
          damage: $damage,
          additionalNotes: $additionalNotes,
          modifiedAt: datetime($modifiedAt)
        });
      `,
        report,
      );
    }

    const relationships = loadJSON("relationships.json");
    for (const relation of relationships) {
      await session.run(
        `MATCH (start${props(relation.startNode)}),
              (end${props(relation.endNode)})
        CREATE (start)-[:${relation.relationshipType}]->(end);`,
      );
    }
    console.log("Данные загружены");
  } catch (error) {
    console.error("Ошибка при импорте данных:", error);
  } finally {
    await session.close();
  }
};

const initializeDatabase = async () => {
  console.log("Ожидание подключения к базе данных...");

  const connected = await retryConnection(driver);
  if (!connected) {
    console.error("Ошибка: база данных недоступна.");
    return;
  }

  await createDatabaseStructure();

  await clearDB();
  await importData();
  console.log("Запуск авто-тестов...");
  await runApiTests(apiRouter);

  await clearDB();
  await importData();
  setDbReady(true);
  console.log("База данных готова принимать запросы.");
};

initializeDatabase();
