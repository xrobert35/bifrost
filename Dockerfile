FROM node:10.15.0-alpine

# install c++
RUN mkdir -p /app
RUN mkdir -p /app/dist
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g

WORKDIR /app

COPY . .

RUN npm install

# build application
RUN npm run client:build
RUN npm run server:build

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

CMD ["/start.sh"]
