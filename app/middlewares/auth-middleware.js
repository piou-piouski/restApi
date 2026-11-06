const jwt = require('jsonwebtoken');

const verifyToken = (token) => jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    {
        issuer: "bobo-api",
        audience: "my-bobo-client.fr",
        subject: "bobo-users",
        algorithms: ["HS256"]
    }
);

// Récupère le token : d'abord l'en-tête "Authorization: Bearer <token>", sinon le cookie "token"
const getToken = (req) => {
    const authHeader = req.headers['authorization'];
    if(authHeader && authHeader.startsWith('Bearer ')){
        return authHeader.split(' ')[1];
    }
    // Le cookie contient directement le token (pas de "Bearer ")
    return req.cookies?.token;
}

const authFailed = (req, res, detail) => res.status(401).type("application/problem+json").json({
    status: 401,
    title: "Auth failed",
    detail,
    instance: req.originalUrl ?? ""
});

const authMiddleware = (req, res, next) => {
    const token = getToken(req);

    if(!token){
        return authFailed(req, res, "Token manquant");
    }

    try{
        req.token = verifyToken(token);
        return next();
    }catch(err){
        // Token expiré, mal signé, mauvais issuer/audience...
        return authFailed(req, res, err.name === 'TokenExpiredError' ? "Token expiré" : "Token invalide");
    }
}

module.exports = authMiddleware
