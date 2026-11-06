const express = require('express');
const usersCtrl = require('../controllers/users-controller');
const validationMiddleWare = require('../middlewares/validation-middleware');
const usersRoutes = express.Router();

usersRoutes.post('/', [validationMiddleWare.email, validationMiddleWare.report], usersCtrl.create)
// usersRoutes.route('/')
//     .post([validationMiddleWare.email, validationMiddleWare.report], usersCtrl.create)
//     .all((req, res)=>{
//         res.set('Allow', 'POST');
//         // return res.status(405).json({code:405, message: `Méthode ${req.method} non autorisé`});
//         return res.status(405).json({code:405, message: `Pourquoi tu viens ici en ${req.method} ?`});
//     });

module.exports = usersRoutes;