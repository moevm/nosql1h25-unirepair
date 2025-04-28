#!/bin/sh
docker-compose up --build --no-deps -d db
MODE=prod docker-compose up --build --force-recreate --no-deps js
