FROM node:10.15.0-alpine

# install c++
RUN mkdir -p /app


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
EXPOSE 8080
# Expose node server port
EXPOSE 4000

RUN mkdir -p /run/nginx

WORKDIR /

# Add a startup script
ADD ./start.sh /start.sh
RUN chmod 755 /start.sh

CMD bin/sh ./start.sh
