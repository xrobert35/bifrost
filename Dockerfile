FROM node:10.14.2-slim

RUN mkdir -p /app
RUN mkdir -p /app/dist
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g

WORKDIR /app

COPY . .

RUN npm install

RUN npm run client:build
RUN npm run server:build

CMD npm run server
