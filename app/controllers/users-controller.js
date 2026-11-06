const {User} = require("../../database/models");
const UserDto = require("../dto/UserDto");

const usersCtrl = {
    async create(req, res, next){

        try{
            const data = UserDto.create(req.body ?? {})

            if(!data.email || !data.password){
                req.status = 400
                req.message = 'email et password sont obligatoires'
                return next()
            }

            const user = await User.findOne({
                where: {
                    email: data.email.trim().toLowerCase()
                }
            })

            if(user){
                req.status = 409
                req.message = 'Cet email est déjà utilisé'
                return next()
            }

            const newUser = await User.create(data)

            return res.status(201).location('/api/v1/users/' + newUser.id).json({
                code: 201,
                message: 'user created',
                location: '/api/v1/users/' + newUser.id
            })

        }catch(err){
            console.error(err)
            if(err.name === 'SequelizeValidationError'){
                req.status = 400
                req.message = err.errors.map(e => e.message).join(', ')
                return next()
            }
            if(err.name === 'SequelizeUniqueConstraintError'){
                req.status = 409
                req.message = 'Cet email est déjà utilisé'
                return next()
            }
            req.status = 500
            req.message = 'Erreur serveur'
            return next()
        }
    },
    async read(req, res, next){
        // req.token est rempli par authMiddleware (payload du JWT)
        const { id } = req.token ?? {};

        try{
            const user = await User.findByPk(id, {
                attributes: {
                    exclude: ['scopes']
                }
            })

            if(!user){
                req.status = 404
                req.message = 'Utilisateur introuvable'
                return next()
            }

            return res.status(200).json({
                code: 200,
                user: user
            })

        }catch(err){
            console.error(err)
            req.status = 500
            req.message = 'Erreur serveur'
            return next()
        }
    },
    async update(req, res, next){

        try{

        }catch(err){

        }
    },
    async delete(req, res, next){

        try{

        }catch(err){

        }
    },


}

module.exports = usersCtrl;