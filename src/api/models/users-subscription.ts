import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.config";

export class UserSubscriptions extends Model {}
UserSubscriptions.init(
    {
        id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            field: "Id"
        },
        userId: {
            type: DataTypes.UUID,
            autoIncrement: false,
            field: "UserId",
            primaryKey: false,
            references: {
            model: 'Users',
            key: 'Id'
            }
        },
        customerId: {
            type: DataTypes.STRING,
            autoIncrement: false,
            field: "CustomerId",
            unique: true
        },
        renewDate : {
            type : DataTypes.DATEONLY,
            autoIncrement : false, 
            field : "RenewDate",
            allowNull : true
        },
        description : {
            type: DataTypes.STRING,
            allowNull: true,
            field: "Description"
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
        sequelize, modelName: 'UserSubscriptions',
        timestamps :true,
        createdAt : "createdAt",
        updatedAt : "updatedAt"
    }
);