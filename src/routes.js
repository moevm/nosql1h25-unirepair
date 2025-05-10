import express from "express";
import driver from "./db.js";
import ApiRouter from "./api_router.js";
import api_routes from "./api_routes.js";
import options from "./options.js";
import { clearDB, exportDB, loadDB } from "./loader.js";

let userCount = null;

export let apiRouter = new ApiRouter("api", api_routes);
export let router = apiRouter.toExpressRouter(() => options.db_ready);

router.get("/api/export_data", async (req, res) => {
  if (!options.db_ready) {
    console.log("Got a query for data export, but the server is not ready yet");
    res.send({ error: "DB is not ready yet" });
    return;
  }
  try {
    const result = await exportDB();
    res.send(result);
  } catch (e) {
    console.log(
      `============================\nFailed to export db: ${e.stack}\n`,
    );
    res.send({ error: e.toString() });
  }
});

router.post("/api/import_data", async (req, res) => {
  if (!options.db_ready) {
    console.log("Got a query for data import, but the server is not ready yet");
    res.send({ error: "DB is not ready yet" });
    return;
  }
  try {
    await clearDB();
    await loadDB(req.body);
    res.send("Ok");
  } catch (e) {
    console.log(
      `============================\nFailed to import db: ${e.stack}\n`,
    );
    res.send({ error: e.toString() });
  }
});

router.get("/status", async (req, res) => {
  if (options.db_ready && userCount === null) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (u:User) RETURN count(u) AS total`,
      );
      userCount = result.records[0].get("total");
      userCount = parseInt(userCount, 10);
    } catch (error) {
      console.error("Ошибка тестового запроса:", error);
    } finally {
      await session.close();
    }
  }

  res.json({ db_ready: options.db_ready, userCount });
});

router.get("/", (req, res) => {
  res.send(`
    <script>
      async function checkStatus() {
        try {
          const response = await fetch('/status');
          const data = await response.json();
          if (data.db_ready) {
            document.body.innerHTML = '<h1>Добро пожаловать! База данных успешно инициализирован.</h1>' +
                                      '<p>Всего пользователей в системе: ' + data.userCount + '</p>';
          } else {
            setTimeout(checkStatus, 2000);
          }
        } catch (error) {
          console.error('Ошибка проверки статуса:', error);
        }
      }
      checkStatus();
    </script>
    <body>Сайт загружается, пожалуйста, подождите...</body>
  `);
});

export default router;
