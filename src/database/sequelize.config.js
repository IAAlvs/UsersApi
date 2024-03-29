import { Sequelize } from "sequelize";
const dbDir = require("./config/config");
const dotenv = require('dotenv');
dotenv.config()

const env = process.env.NODE_ENV || 'development';
// @ts-ignore
const dbConfig = dbDir[env];
const {username, password, database, host, dialect, port, dialectOptions} = dbConfig;
const sequelize = new Sequelize(database, username, password, {
    host,
    dialect,
    dialectOptions,
    port, // default port postgrest
    logging : false
});

const databaseSetup = () => sequelize
.authenticate()
.then(() => {
    console.log('Database conection OK');
})
// @ts-ignore
.catch((error) => {
    console.error('Error when try to connect to database, error: ', error);
})

export {
    sequelize, databaseSetup
};