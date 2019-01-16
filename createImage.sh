#!/bin/bash
npm install

# build application
npm run client:build
npm run server:build

sudo docker build -t xrobert35/bifrost .
