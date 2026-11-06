// const  = require('express');

const { body, validationResult } = require("express-validator")
// const { report } = require("../routes/users-routes")

const validationMiddleWare = {
    email: body('email').notEmpty().bail().isEmail({host_whitelist: ['defense.fr', 'defence.fr']}),
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


