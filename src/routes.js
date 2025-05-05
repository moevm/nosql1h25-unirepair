import express from "express";
import driver from "./db.js";
import ApiRouter from "./api_router.js";
import api_routes from "./api_routes.js";
import options from "./options.js";

let userCount = null;

export let apiRouter = new ApiRouter("api", api_routes);
export let router = apiRouter.toExpressRouter(() => options.db_ready);

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
