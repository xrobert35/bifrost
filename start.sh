# starting nginx server
/usr/sbin/nginx -g "daemon off;" &

# starting node app
cd /app
npm run server:start
