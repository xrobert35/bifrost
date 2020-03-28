FROM node:10.19.0

#update
RUN apt-get update

# install docker
RUN curl -sSL https://get.docker.com/ | sh

# install docker-compose
RUN curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose
RUN ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose


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
RUN apt-get install nginx -y

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
