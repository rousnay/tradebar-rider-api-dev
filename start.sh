#!/bin/bash
cd /tradebar-rider-nest-api
git pull origin main
npm install
pm2 stop all
pm2 start dist/main.js --name tradebar-rider-nest-api
pm2 save