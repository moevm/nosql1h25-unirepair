# Используем легковесный базовый образ
FROM node:alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки зависимостей
COPY ./src/package.json ./src/

# Устанавливаем зависимости
RUN npm install --prefix ./src

# Копируем весь код из src
COPY ./src ./src

# Указываем команду для запуска сервера
CMD ["node", "src/app.js"]

