import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.config";

export class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: false,
      primaryKey: true,
      field: "Id"
    },
    authId :{ 
      type : DataTypes.STRING,
      unique: true,
      field: "AuthId"
    },
    email : {
      type: DataTypes.STRING,
      unique: false,
      field: "Email"
    },
    emailVerified : {
      type: DataTypes.BOOLEAN,
      unique: false,
      allowNull: false,
      field: "EmailVerified"
    },
    picture : {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true,
      field: "Picture"
    },  
    name : {
      type: DataTypes.STRING,
      allowNull: true,
      field: "Name"
    },
    lastName : {
      type: DataTypes.STRING,
      allowNull: true,
      field: "LastName"
    },
    secondLastName : {
      type: DataTypes.STRING,
      allowNull: true,
      field: "SecondLastName"    
    },
    age : {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "Age"    
    },
    address : {
      type : DataTypes.STRING,
      allowNull : true,
      field: "Address"    
    }
  },
  { 
    sequelize, modelName: 'Users',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'  
  }
);