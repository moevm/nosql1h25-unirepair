import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import driver from "./db.js";
import options from "./options.js";
import { apiRouter, router } from "./routes.js";
import { props } from "./query.js";
import { runApiTests } from "./tests/api_tests.js";
import { argv } from "node:process";
import cors from "cors";
import { clearDB, loadDB } from "./loader.js";

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

dotenv.config();

app.use(express.json());
app.use("/", router);
app.listen(PORT, () => {
  console.log(
    `Сервер запущен на http://localhost:${PORT}, но ожидает подключение базы...`,
  );
});

async function retryConnection(driver, retries = 10, delay = 5_000) {
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
}

async function createDatabaseStructure() {
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
}

function loadJSON(filename) {
  const filePath = path.join(__dirname, "src", "data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function importData() {
  await loadDB({
    users: loadJSON("users.json"),
    callforms: loadJSON("call_forms.json"),
    reports: loadJSON("reports.json"),
    inventory: loadJSON("inventory.json"),
    relationships: loadJSON("relationships.json"),
  });
}

async function initializeDatabase() {
  console.log(
    `Running app with arguments: ${argv.map((arg) => `${arg}`).join(" ")}`,
  );
  console.log("Ожидание подключения к базе данных...");

  const connected = await retryConnection(driver);
  if (!connected) {
    console.error("Ошибка: база данных недоступна.");
    return;
  }

  await createDatabaseStructure();

  const is_clean_run = argv[2] === "clean_run";
  options.mode = is_clean_run ? "dev" : "prod";
  if (is_clean_run) {
    console.log("Выбран чистый запуск");
    await clearDB();
    await importData();
    console.log("Запуск авто-тестов...");
    await runApiTests(apiRouter);

    await clearDB();
    await importData();
  }
  options.db_ready = true;
  console.log("База данных готова принимать запросы.");
}

initializeDatabase();
