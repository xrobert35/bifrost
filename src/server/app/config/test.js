const config = {
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  SWAGGER_ACTIVATED: process.env.SWAGGER_ACTIVATED || false,
  CLIENT_ACTIVATED : process.env.CLIENT_ACTIVATED || false,
};
module.exports = { config: config }
