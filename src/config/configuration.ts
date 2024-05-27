export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  app: {
    name: process.env.APP_NAME || 'App',
    description: process.env.APP_DESCRIPTION || 'App Description',
    version: process.env.APP_VERSION || '1.0',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'test',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test',
  },
  cloudFlare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    accountHash: process.env.CLOUDFLARE_ACCOUNT_HASH,
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  logger: {
    level: process.env.LOGGER_LEVEL || 'info',
    debug: process.env.DEBUG || 'info',
    json: process.env.USE_JSON_LOGGER,
    sentryDns: process.env.SENTRY_DNS,
  },
});
