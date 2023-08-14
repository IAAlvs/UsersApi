const Sequelize = require('sequelize');
//import {db} from "../api/models/index";
import dbDir from "../api/config/config";
import  dotenv from 'dotenv';
dotenv.config()
const env = (process.env.TEST_ENV)?"test":process.env.NODE_ENV || 'development';
const dbConfig = dbDir[env];
const {username, password, database, host, dialect, port} = dbConfig;
const sequelize = new Sequelize(database, username, password, {
    host,
    dialect,
    port, // Puerto por defecto de PostgreSQL
    logging : false
});

const databaseSetup = () => sequelize
.authenticate()
.then(() => {
    console.log('Database conection OK');
})
.catch((error) => {
    console.error('Error when try to connect to database, error: ', error);
})

export {
    sequelize, databaseSetup
};