const errorsMiddleWare = (req, res) => {
    const errorCode = req.status ?? 400;
    const message = req.message ?? 'Erreur random';
    return res.status(errorCode).json({message});
}

module.exports = errorsMiddleWare;