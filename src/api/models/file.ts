/* import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/database.config";

export class File extends Model {}
File.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: false,
      primaryKey: true,
      field: "Id"
    },
    uploadDate :{ 
      type : DataTypes.DATEONLY,
      unique: true,
      field: "UploadDate"
    },
    url : {
      type: DataTypes.STRING,
      allowNull: true,
      field: "Url"
    },
    type : {
      type: DataTypes.STRING,
      field: "Type"
    },
    name : {
      type: DataTypes.STRING,
      field: "Name"
    },
    size : {
      type: DataTypes.STRING,
      allowNull: true,
      field: "Size"    
    }
  },
  { 
    sequelize, modelName: 'Files',
    timestamps: false,
  }
); */