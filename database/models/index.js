const path = require('node:path');
// const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: 'a'})

const dotenv = require('dotenv');
dotenv.config({
    path: path.join(__dirname, process.env.NODE_ENV == "prod" ? ".env.prod" : ".env")
})


const dbClient = require("../connect");
const Product = require("./Product");
const User = require("./User");

User.hasMany(Product, {
    as: "assets",
    foreignKey: {
        name: "owner_id",
        allowNull: false
    }
})

Product.belongsTo(User, {
    as: "owner",
    foreignKey: {
        name: "owner_id",
        allowNull: false
    }
})

// async function sync() {
//     await dbClient.sync(
//         {force: true}
//     )
// }

// sync()

module.exports = { User, Product }