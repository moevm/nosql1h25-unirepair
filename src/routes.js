import express from "express";
import driver from "./db.js";
import ApiRouter from "./api_router.js";
import api_routes from "./api_routes.js";

let userCount = null;
let dbReady = false;

export let apiRouter = new ApiRouter("api", api_routes);
export let router = apiRouter.toExpressRouter();

export function setDbReady() {
  dbReady = true;
}

router.get("/status", async (req, res) => {
  if (dbReady && userCount === null) {
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

  res.json({ dbReady, userCount });
});

router.get("/", (req, res) => {
  res.send(`
    <script>
      async function checkStatus() {
        try {
          const response = await fetch('/status');
          const data = await response.json();
          if (data.dbReady) {
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
