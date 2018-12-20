# Univ Base Project

This project is a POC, mixing NestJS and Angular Universal in one archive.

Simply clone this project and run it !

run 
```
npm run build
```

To build everything

use

```
npm run server:start
```

To start everything. 

By default 2 serveur will be launch :
* the universal client server :  from  server/app/client.server.ts on port 4080
* this nestjs server : from server/app/main.ts on port 4000

go on  http://localhost:4080 to see the universal ui. You should normaly be on the login page. To be able to continue you will need an auth server running on http://localhost:3000  (take a look at the proxy.config.json)

You can checkout my project : https://github.com/xrobert35/univ-auth  and run it ;) (you will find a default admin account in the configuration files)

You can also run this project without building it by using the vscode "launch server" configuration

## Testing

This project is ready to be tested, all the necessary "jest" configuration are in place

## Docker

You can also use docker to build and expose this project,  you will find a ready to use Dockerfile at the root of the project
