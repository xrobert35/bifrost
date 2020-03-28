const config = {
  SERVER_PORT: process.env.SERVER_PORT || '4000',
  CLIENT_PORT: process.env.CLIENT_PORT || '4080',
  CLIENT_ACTIVATED: process.env.CLIENT_ACTIVATED || true,
  CLIENT_PROXY_ACTIVATED: process.env.CLIENT_PROXY_ACTIVATED || true,
  SERVER_PATH : process.env.SERVER_PATH || '/api',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SWAGGER_ACTIVATED: process.env.SWAGGER_ACTIVATED || false,
  DOCKER_REPO_KEYS : process.env.DOCKER_REPO_KEYS || null,
  SERVER_DATA: process.env.SERVER_DATA || '/opt/bifrost',
  DEFAULT_COMPOSE_FOLDER : process.env.DEFAULT_COMPOSE_FOLDER || '/opt/docker/compose'
}
module.exports = { config: config }
