console.log('Loading environment variables...');
require('dotenv').config()
const { Sequelize } = require("sequelize");

const environment = "test"
const config = require('./config/config.json')[environment]

// Determine the database name based on the environment
const databaseName = environment === "test" ? config.database_test : config.database

// Set the database name in the configuration object
config.database = databaseName
console.log(config)

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: environment === "test" ? false : undefined // Disable Sequelize logging during tests
});

module.exports = {
    sequelize
}