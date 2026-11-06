const cors = require("cors");
const helmet = require("helmet"); 
const express = require("express");
const app = express();
const fs = require('fs');
const morgan = require('morgan');
const path = require('node:path');
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: 'a'})
const usersRoutes = require('./app/routes/users-routes');
const errorsMiddleWare = require('./app/middlewares/errors-middleware');

const dotenv = require('dotenv');
const authRoutes = require("./app/routes/auth-routes");
const createLimiter = require("./app/middlewares/rate-limit-middleware");
dotenv.config({
    path: path.join(__dirname, process.env.NODE_ENV == "prod" ? ".env.prod" : ".env")
})

app.use(createLimiter());

app.set("port", process.env.PORT);
app.set("host", process.env.HOST);

app.use(express.urlencoded({extended: true, limit: '100k'}));
app.use(express.json({limit: '100k'})); //capable de parser le json (sérialiser/désérialiser)
app.use(cors()); // à modifier
app.use(helmet());
app.use(morgan("combined", {stream: accessLogStream}))
app.get("/", (req, res) => {
    return res.json({ message: "This is how... you call back me..."})
})

 // limite globale : 100 requêtes / 15 min par IP

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use(errorsMiddleWare);



app.listen(app.get("port"), app.get("host"), () => {
    console.log(`Listening at http://${process.env.HOST}:${process.env.PORT}`);
})
