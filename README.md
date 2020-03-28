# Bifröst Project

<img src="https://github.com/xrobert35/bifrost/blob/master/docker.png" data-canonical-src="https://github.com/xrobert35/bifrost/blob/master/docker.png" width="250" height="auto" />

Proxify your Docker :)

This project allow you to generate nginx proxypass configuration based on your docker container.

It can also be used to quickly update a container to the newest version of the image tag

## Installation 

### docker compose

Minimal compose 

```
version: "3.5"

services:
  bifrost:
    image: xrobert35/bifrost:latest
    container_name: bifrost
    ports:
    - "4080:4080" #website
    - "4081:4081" #websocket
    - "80:80" #nginx
    volumes:
      - /opt/bifrost:/opt/bifrost #bifrost data
      - /var/run/docker.sock:/var/run/docker.sock #give access to docker
      - /opt/docker:/opt/docker #your docker management folder 
    environment:
      - DOCKER_PRIVATE_REPO_BASE64_KEY=repo-name1:base64-privatekey1;repo-name2:base64-privatekey2
    restart: always
```

## How to use

Bifrost include a website for configuration and come when an nginx server that you will update thanks to the website

The website is launched on 4080 and will list all your container. You can than edit proxy configuration for some of them and click on "update proxy"  the configuration will be created in "/etc/nginx/conf.d/default.conf" and the nginx configuration will be automatically realoded

### Options 

DOCKER_PRIVATE_REPO_BASE64_KEY contain a list of private repository key who will be used to update container
```
    environment:
      - DOCKER_PRIVATE_REPO_BASE64_KEY=repo-name1:base64-privatekey1;repo-name2:base64-privatekey2
```

### Docker

UI for docker, allowing you to check logs, start, update, remove, restart containers

### Nginx UI

UI for nginx allowing you to add some proxy

### Docker compose

Online Editor allowing you to manage your compose, and also up and down stacks

### Web uploading

Simple upload interface, allowing you to drop file (cool for dumps etc...)

## Why ?

This projet has been created to help developers when creating micro-service application, some of the microservice can for exemple run on a docker container but you will still need to launch some of them on your favorite IDE for debug purpose. Thanks to this projet you will be able to easily switch from IDE to container. 

## How to Dev

Back

There's a vscode debug launcher or
```
npm run server:run

Front 
```
npm start
```

## How to build

### The project

```
npm run build
```

### Docker image

build  the project first

```
docker build -t xrobert35/bifrost2 .
```
