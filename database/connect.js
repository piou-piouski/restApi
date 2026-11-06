const path = require('node:path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Les fichiers .env sont à la racine du projet, donc un dossier au-dessus de /database
const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.local';
const result = dotenv.config({ path: path.join(__dirname, '..', envFile), quiet: true });
if (result.error) {
    console.error(`Impossible de charger ${envFile} :`, result.error.message);
}

const dbClient = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost', // 'db' si l'API tourne dans le compose
        port: Number(process.env.DB_PORT) || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false,
    }
);

// À appeler au démarrage du serveur : await connectDb()
async function connectDb() {
    try {
        await dbClient.authenticate();
        console.log('DB Connected :)');
    } catch (err) {
        console.error('Connexion à la DB impossible :', err.message);
        throw err;
    }
}

module.exports = dbClient;
module.exports.connectDb = connectDb;
