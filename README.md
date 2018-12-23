# Bifröst Project


![biforst](https://github.com/xrobert35/bifrost/blob/master/docker.png)

Proxify your Docker :)

This project allow you to generate nginx proxypass configuration based on your docker container.

## Installation (not yet available)

```
services:
  bifrost:
    image: bifrost:latest
    container_name: bifrost
    volumes: 
      - /opt/bifrost:/opt/bifrost
      - /var/run/docker.sock:/var/run/docker.sock
    restart: always

  nginx:
    image: nginx:latest
    container_name: nginx
    volumes: 
      - /opt/bifrost/nginx:/etc/nginx/conf
    restart: always
```
