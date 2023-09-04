//This CAN NOT be change to ESM JS cause sequelize cli is not friendly for this
const { config } = require('dotenv');
config()

let dbConfig = {
  username : "", 
  password : "", 
  database:"", 
  host:"",
  dialect:"",
  port:""
};
if(process.env.NODE_ENV  !== "test"){
  // @ts-ignore
  dbConfig= JSON.parse(process.env.DB_CONFIG);
}
const environmentsConfig = {
  development: {
    "username": dbConfig.username,
    "password": dbConfig.password,
    "database": dbConfig.database,
    "host": dbConfig.host,
    "dialect": dbConfig.dialect,
    "port" : dbConfig.port,
    "dialectOptions": {
      "createDatabaseIfNotExist": true,
      "ssl": {
        "require": true,
        "rejectUnauthorized": false 
      } 
    }
  },
  test: {
    "dialect": "sqlite",
    "storage": ":memory:",
    "dialectOptions": {
      "createDatabaseIfNotExist": true,
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      } 
    }
  },
  production: {
    "username": dbConfig.username,
    "password": dbConfig.password,
    "database": dbConfig.database,
    "host": dbConfig.host,
    "dialect": dbConfig.dialect,
    "port" : dbConfig.port,
    "dialectOptions": {
      "createDatabaseIfNotExist": true,
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      } 
    }
  },
}
module.exports =  environmentsConfig;