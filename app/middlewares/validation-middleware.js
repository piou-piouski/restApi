// const  = require('express');

const { body, validationResult } = require("express-validator")
// const { report } = require("../routes/users-routes")

const validationMiddleWare = {
    email: body('email').notEmpty().bail().trim().isEmail({host_whitelist: ['defense.fr', 'defence.fr']}),
    password: body('password').notEmpty().bail().trim().isStrongPassword(
        {
            minLength: 15,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1,
            minLowercase: 1
        }
    ),
    ifPassword: body('password').optional().custom(this.password),
    report: (req, res, next) => {
        const report = validationResult(req);
        if(report.isEmpty()){
            return next();
        }
        return res.status(422).header("Content-type", "application/problem+json").json({
            type: "https://claude.ai/",
            detail: report.array(),
            title: "Probleme de données",
            code: 422
        })
    }
}

module.exports = validationMiddleWare


