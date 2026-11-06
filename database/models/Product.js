const { DataTypes, Model } = require('sequelize');

const dbClient = require("../connect.js");

class Product extends Model {}

Product.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    title:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    code:{
        type: DataTypes.STRING(10),
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
},
{
    sequelize: dbClient,
    tableName: "products"
})

module.exports = Product