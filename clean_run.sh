#!/bin/sh
docker-compose up --build --no-deps -d db
MODE=clean_run docker-compose up --build --force-recreate --no-deps js
