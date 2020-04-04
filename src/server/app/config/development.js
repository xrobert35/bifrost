const config = {
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  SWAGGER_ACTIVATED: process.env.SWAGGER_ACTIVATED != null ? process.env.SWAGGER_ACTIVATED : true,
  CLIENT_ACTIVATED: process.env.CLIENT_ACTIVATED != null ? process.env.CLIENT_ACTIVATED : false,
  CLIENT_PROXY_ACTIVATED: process.env.CLIENT_PROXY_ACTIVATED != null ? process.env.CLIENT_PROXY_ACTIVATED : true,
};
module.exports = { config: config }
