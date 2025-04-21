#!/bin/sh
docker-compose up --build --no-deps -d db
docker-compose up --build --force-recreate --no-deps js
