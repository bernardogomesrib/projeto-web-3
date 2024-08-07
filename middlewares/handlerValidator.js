const { validationResult } = require('express-validator')

function handlerValidate(req, res, next) {
    const errors = validationResult(req)
    if (errors.isEmpty()){
        return next()
    } 
    const arrayErrors = []

    errors.array().map(e => { 
        if (e.type === 'field'){
            arrayErrors.push({ [e.path]: e.msg })
        }
    })

    return res.status(400).json({ errors: arrayErrors})
}

module.exports = handlerValidate