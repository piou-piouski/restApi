const jwt = require('jsonwebtoken');

const verifiyToken = () => {
    const verifyToken = jwt.verify(
                    token,
                    process.env.TOKEN_SECRET,
                    {
                        issuer: "bobo-api",
                        audience: "my-bobo-client.fr",
                        subject: "bobo-users",
                        algorithms: ["HS256"]
                    }
                )
    return verifyToken;
}
const authMiddleware = (req, res, next) => {
    
    if("authorization" in req.headers){
        const token = req.headers['authorization'].split(" ")[1];
        if(token){
            try{
                req.token = verifiyToken(token);
                next();

            }catch(err){
                console.error(err);
                next(err);
            }
        }
    }

    if("token" in req.cookies){
        const token = req.cookies['token'].split(" ")[1];
        if(token){
            try{
                req.token = verifiyToken(token);
                next();

            }catch(err){
                console.error(err);
                next(err);
            }
        }
    }

    return req.status(401).type("application/problem+json").json({
        status: 401,
        title: "Auth failed",
        detail: "Description de Auth failed",
        instance: req.url ?? ""
    })
}

module.exports = authMiddleware