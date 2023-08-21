import express,{Response}  from "express";
import { RegisterRoutes } from "./routes/routes";
import AddMiddlewares from "./middlewares/AddMiddlewares";
import {databaseSetup} from "../database/sequelize.config";
import errorHandler from "./utils/ErrorHandler";
const expressPort = process.env.EXPRESS_SERVER_PORT || 4000;
const environment:string = process.env.NODE_ENV || 'development';

//running
console.log(`Running in ${environment} environment`)
//Database config
databaseSetup();
//Running app 
const app: express.Application = express();
// Middlewares
AddMiddlewares(app);
// Api routes
RegisterRoutes(app);
app.use(errorHandler)

// Server running
const server = app.listen(expressPort, () => {
  console.log(`Server starting at : http://localhost:${expressPort}`);
});
if(process.env.NODE_ENV == "test")
  server.close();
export default app;