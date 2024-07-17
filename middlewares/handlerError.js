const { body } = require('express-validator')
function handlerError(method) {
    switch (method) {
        case 'user': {
            return [
                body('nome').exists().isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
                body('email')
                    .exists().isEmail().withMessage('Email inválido')
                , body('password').exists()
                    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
                    .matches(/((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]).*$/).withMessage
                    ('Senha deve conter ao menos uma letra maiúscula, uma minúscula, um caractere especial e um número')
            ]
        }
        case 'login': {
            return [
                body('login').exists().withMessage('Login é obrigatório'),
                body('password').exists().withMessage('Senha é obrigatória')
            ]
        }
        case 'forget': {
            return [
                body('email').exists().isEmail().withMessage('Email inválido')
            ]
        }
        case 'reset': {
            return [
                body('newPassword').exists()
                    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
                    .matches(/((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]).*$/).withMessage
                    ('Senha deve conter ao menos uma letra maiúscula, uma minúscula, um caractere especial e um número')
            ]
        }
    }
}

module.exports = handlerError