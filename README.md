# SoftiaData App Documentation

This documentation provides an overview of how to use and work with the Softiadata App.

## Table of Contents
- [Installation](#installation)
- [Running the API](#running-the-api)
- [Api Routes](#api-routes)
- [Swagger](#swagger-autogen)
- [Sequelize](#sequelize)
- [.sequelizerc File](#sequelizerc-file)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)
- [Express Migrations](#migrations)

## Installation

To install the project dependencies, run the following command:

**npm install**


## Running the API

To start the API in development mode, use the following command:

**npm run dev**


This command will concurrently run the Next.js development server and the Express.js server for the API.

## Api Routes
Api routes are automatically generated when you add a controller
Tsoa automatically generated **routes.ts** file that contains all the 
functionallity for our api and swagger.
Actually you can generate running : **yarn run tsoa routes**

## Swagger
Swagger files is automatically generated for **Tsoa** and you dont need
to care about its generation its automatically generated when builds aplication.


## Sequelize

Sequelize is an ORM (Object-Relational Mapping) library for Node.js, which provides an easy way to interact with databases. In this project, Sequelize is used for database management.

## .sequelizerc File

The `.sequelizerc` file is a configuration file for Sequelize CLI (Command-Line Interface). It allows you to customize the paths and settings for your Sequelize project.

## Scripts
- `npm run predev`: Generates swagger file that works for documentation.
- `npm run dev`: Starts the API in development mode using Next.js and Express.js.
- `npm run prebuild`: Generates swagger file that works for documentation and also 
    modifies routes that are automatically generated.
- `npm run build`: Builds the Next.js application for production.
- `npm run prestart`: Executes the build script before starting the API.
- `npm start`: Starts the API in production mode.
- `npm run lint`: Runs the linting process using Next.js lint.
- `npm test`: Runs the tests using Jest.
- `npm run swagger-autogen`: Generates the Swagger documentation using Swagger-Autogen.

## Executing Migrations

Migrations are used to manage database schema changes over time. Sequelize provides a CLI command for executing migrations.

To run the migrations and update your database schema, follow these steps:

1. Make sure your database connection is properly configured in the **.env** file or the **config/config.js** file.

2. Create a new migration file by running the following command:

npx sequelize-cli migration:generate --name **<migration-name>**

Replace <migration-name> with a descriptive name for your migration.

3. Open the newly created migration file located in the **migrations** directory. This file contains **up** and **down** functions.

    The up function defines the actions to be performed when applying the migration, such as creating tables or modifying columns.

    The down function defines the actions to be performed when reverting the migration, such as dropping tables or reverting column modifications.

4. Implement the necessary changes in the **up** and **down** functions based on your desired schema modifications.

5. To apply the migration and update the database schema, run the following command:

**npx sequelize-cli db:migrate**


This command executes all pending migrations.
If you need to revert the migration and undo the changes, you can run:

**npx sequelize-cli db:migrate:undo**

This command reverts the last executed migration.
You can also revert all migrations by running:

**npx sequelize-cli db:migrate:undo:all**

This command will revert all migrations in reverse order.

6. After running the migrations, your database should reflect the updated schema.

Remember to run the migrations whenever you make changes to your database schema to keep it in sync with your Sequelize models.

Feel free to customize the instructions based on your project's specific migration workflow and requirements.
