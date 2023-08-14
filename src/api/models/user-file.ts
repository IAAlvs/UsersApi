import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/database.config";

export class UserFiles extends Model {}
UserFiles.init(
  {
    userId: {
      type: DataTypes.UUID,
      autoIncrement: false,
      field: "UserId",
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'Id'
      }
    },
    fileId: {
        type: DataTypes.UUID,
        autoIncrement : false, 
        field : "FileId",
        primaryKey : true
    },
    fileName: {
      type: DataTypes.STRING,
      autoIncrement : false, 
      field : "FileName",
      allowNull : false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      autoIncrement : false, 
      field : "FileSize",
      allowNull : false
    },
    fileType: {
      type: DataTypes.STRING,
      autoIncrement : false, 
      field : "FileType",
      allowNull : false
    },
    dropDate : {
      type : DataTypes.DATEONLY,
      autoIncrement : false, 
      field : "DropDate",
      allowNull : false
    },
    visible : {
      type: DataTypes.BOOLEAN,
      field : "Visible",
      allowNull : false,
    },
    createdAt : {
      type: DataTypes.DATE,
      field : "CreatedAt"
    },
    updatedAt : {
      type: DataTypes.DATE,
      field : "UpdatedAt"
    }
  },
  { 
    sequelize, modelName: 'UserFiles',
    timestamps :true,
    createdAt : "createdAt",
    updatedAt : "updatedAt"
    
  }
);