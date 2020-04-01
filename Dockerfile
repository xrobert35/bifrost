FROM docker:19.03.8-dind

#update
RUN apk update

# install c++
RUN mkdir -p /app

RUN apk add curl
RUN apk add bash

## install nodejs
RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.11/main/ nodejs=12.15.0-r1
## install npm
RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.11/main/ npm=12.15.0-r1
## install docker-compose
RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.11/main/ docker-compose=1.24.1-r3

WORKDIR /app

COPY dist dist
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig-paths.server.bootstrap.js tsconfig-paths.server.bootstrap.js
COPY tsconfig.json tsconfig.json
COPY proxy.conf.json proxy.conf.json

# install production modules
RUN npm install --production

# install Nginx
RUN apk add nginx

# Expose Nginx port
EXPOSE 80
# Expose node server port
EXPOSE 4080

RUN mkdir -p /run/nginx

WORKDIR /

# Add a startup script
ADD ./start.sh /start.sh
RUN chmod 755 /start.sh

CMD bin/sh ./start.sh
