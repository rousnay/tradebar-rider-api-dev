#!/bin/bash
cd /tradebar-rider-api-dev
git pull origin main
npm install
pm2 stop all
pm2 start dist/main.js --name tradebar-rider-api-dev
pm2 save