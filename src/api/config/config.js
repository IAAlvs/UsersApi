//THis cant be change to ESM JS cause sequelize cli is not friendly for this
const { config } = require('dotenv');
config()
const dbConfig = JSON.parse(process.env.DB_CONFIG);
const environmentsConfig = {
  development: {
    "username": dbConfig.username,
    "password": dbConfig.password,
    "database": dbConfig.database,
    "host": dbConfig.host,
    "dialect": dbConfig.dialect,
    "port" : dbConfig.port
  },
  test: {
    "dialect": "sqlite",
    "storage": ":memory:"
  },
  production: {
    "username": dbConfig.username,
    "password": dbConfig.password,
    "database": dbConfig.database,
    "host": dbConfig.host,
    "dialect": dbConfig.dialect,
    "port" : dbConfig.port
  }
}
module.exports =  environmentsConfig;