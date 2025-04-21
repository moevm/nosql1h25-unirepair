FROM node:alpine

WORKDIR /app
VOLUME ["/app/src/data", "/app/front/fire-station/build"]

COPY ./src/package.json ./src/package-lock.json ./src/
RUN npm install --prefix ./src

COPY ./front/fire-station/package.json ./front/fire-station/package-lock.json ./front/fire-station/
RUN npm install --prefix ./front/fire-station

COPY ./src/*.js ./src
COPY ./front/fire-station ./front/fire-station

CMD ["sh", "-c", "node src/app.js & npm run dev --prefix front/fire-station"]
