const jwt = require("jsonwebtoken")
const UserControl = require('../controllers/UserControl')

function routerAccess(tipos) {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ msg: "Unauthorized" })
        }

        const [, token] = authHeader.split(' ')

        try {
            const tokenInvalidExists = await UserControl.getToken(token)
            if (tokenInvalidExists) {
                return res.status(401).json({ msg: 'Faça login novamente!' })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (!tipos.includes(decoded.tipo)) {
                return res.status(401).json({ msg: 'Unauthorized' })
            }
            req.user = decoded
            next()
        } catch (error) {
            return res.status(401).json({ msg: 'Token Inválido!' })
        }
    }
}

const adminAuth = routerAccess([2])
const userAuth = routerAccess([1,2])

module.exports = { adminAuth, userAuth }
