const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {User} = require('../../database/models')

const authCtrl = {
    async login(req, res, next){

        const { email, password } = req.body ?? {};

        if(!email || !password){
            req.status = 400
            req.message = 'email et password sont obligatoires'
            return next()
        }

        try{
            const user = await User.findOne({
                where:{
                    // les emails sont stockés en minuscules par le modèle User
                    email: email.trim().toLowerCase()
                }
            })

            // Même message pour "email inconnu" et "mauvais mot de passe" :
            // on ne révèle pas à un attaquant quels emails existent
            if(!user || !(await bcrypt.compare(password, user.password))){
                req.status = 401
                req.message = 'Email ou mot de passe incorrect'
                return next()
            }

            const token = jwt.sign(
                {
                    id: user.id
                },
                process.env.TOKEN_SECRET,
                {
                    issuer: "bobo-api",
                    audience: "my-bobo-client.fr",
                    subject: "bobo-users",
                    expiresIn: 15*60 // en SECONDES pour jsonwebtoken : 15 minutes
                }
            )

            res.cookie("token", token, {
                maxAge: 15*60*1000,
                httpOnly: true,
                secure: false
            })

            return res.status(200).json({code:200, message : "Bienvenue "+user.email, token});
        }catch(err){
            console.error(err)
            req.status = 500
            req.message = 'Erreur serveur'
            return next()
        }
    }
}

module.exports = authCtrl