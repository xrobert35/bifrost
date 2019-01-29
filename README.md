# Bifröst Project


![biforst](https://github.com/xrobert35/bifrost/blob/master/docker.png)

Proxify your Docker :)

This project allow you to generate nginx proxypass configuration based on your docker container.

It can also be used to quickly update a container to the newest version of the image tag

## Installation 

### docker compose

```
version: "3.3"

services:

  bifrost:
    image: xrobert35/bifrost:latest
    container_name: bifrost
    ports:
    ports:
      - "4080:4080"
      - "80:80"
    volumes:
      - /opt/bifrost:/opt/bifrost
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DOCKER_PRIVATE_REPO_BASE64_KEY="repo-name1:base64-privatekey1;repo-name2:base64-privatekey2"
    restart: always
```

## How to use

Bifrost include a website for configuration and come when an nginx server that you will update thanks to the website

The website is launched on 4080 and will list all your container. You can than edit proxy configuration for some of them and click on "update proxy"  the configuration will be created in "/etc/nginx/conf.d/default.conf" and the nginx configuration will be automatically realoded

DOCKER_PRIVATE_REPO_BASE64_KEY contain a list of private repository key who will be used to update container

## Why ?

This projet has been created to help developers when creating micro-service application, some of the microservice can for exemple run on a docker container but you will still need to launch some of them on your favorite IDE for debug purpose. Thanks to this projet you will be able to easily switch from IDE to container. 
