const express = require('express');
const authCtrl = require('../controllers/auth-controller');
const createLimiter = require('../middlewares/rate-limit-middleware');
const authRoutes = express.Router();

const authLimiter = createLimiter({ windowMs: 3 * 60 * 1000, limit: 5 });

authRoutes.post('/', [authLimiter], authCtrl.login)
// authRoutes.route('/')
//     .post([], authCtrl.login)
//     .all((req, res)=>{
//         res.set('Allow', 'POST');
//         // return res.status(405).json({code:405, message: `Méthode ${req.method} non autorisé`});
//         return res.status(405).json({code:405, message: `Pourquoi tu viens ici en ${req.method} ?`});
//     });

module.exports = authRoutes;