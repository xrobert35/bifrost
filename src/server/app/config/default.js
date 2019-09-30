const config = {
  SERVER_PORT: process.env.SERVER_PORT || '4000',
  CLIENT_PORT: process.env.CLIENT_PORT || '4090',
  CLIENT_ACTIVATED: process.env.CLIENT_ACTIVATED || true,
  CLIENT_PROXY_ACTIVATED: process.env.CLIENT_PROXY_ACTIVATED || true,
  SERVER_PATH : process.env.SERVER_PATH || '/api',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SWAGGER_ACTIVATED: process.env.SWAGGER_ACTIVATED || false,
  AUTH_JWT_KEY: process.env.AUTH_JWT_KEY || 'I015U2VjcmV0SldUNCFJbmV4eXM=',
  DOCKER_PRIVATE_REPO_BASE64_KEY : process.env.DOCKER_PRIVATE_REPO_BASE64_KEY || null,
  SERVER_DATA: '/opt/bifrost'
}
module.exports = { config: config }
