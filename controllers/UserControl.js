require('dotenv').config()
const User = require("../entities/User")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const Tokens = require('../entities/Tokens')
const smtpTransporter = require('../config/nodemailerConfig')

const UserControl = {
    async getUserByName(nome) {
        try {
            return await User.findOne({
                where: {
                    nome
                }
            })
        } catch (error) {
            throw new Error('Erro ao buscar usuário pelo nome ' + error.message)
        }

    },
    async getUserByEmail(email) {
        try {
            return await User.findOne({
                where: {
                    email
                }
            })
        } catch (error) {
            throw new Error('Erro ao buscar usuário por email ' + error.message)
        }
    },
    async getToken(token) {
        try {
            return await Tokens.findOne({
                where: {
                    token
                }
            })
        } catch (error) {
            throw new Error('Erro ao buscar token: ' + error.message)
        }
    },
    gerarToken(user) {
        return jwt.sign({
            id: user.id,
            nome: user.nome,
            tipo: user.tipo
        }, process.env.JWT_SECRET)
    },

    meusDados(req, res) {
        // #swagger.tags = ['Auth']
        // #swagger.security = [{ "Bearer": [] }]
        const userLogged = req.user;
        if (!userLogged) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        return res.status(200).json({ user: userLogged });
    },

    async getAll(req, res) {
        // #swagger.tags = ['User']
        // #swagger.security = [{ "Bearer": [] }]
        try {
            res.json(await User.findAll({
                attributes: {
                    exclude: ['password']
                }
            }))
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao buscar os Users - ' + error.message,
                name: error.name,
                stack: error.stack
            })
        }
    },

    async getById(req, res) {
        // #swagger.tags = ['User']
        // #swagger.security = [{ "Bearer": [] }]
        // #swagger.parameters['id'] = { description: 'ID do usuário' }
        const { id } = req.params;
        try {
            const UserInstance = await User.findByPk(id, {
                attributes: {
                    exclude: ['password']
                }
            })
            if (!UserInstance) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.json(UserInstance)
        } catch (error) {
            throw new Error('Erro ao buscar usuário por ID' + error.message)
        }
    },

    async save(req, res) {
        // #swagger.tags = ['User']
        const { nome, email, password } = req.body
        const ultimoIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        try {
            const userName = await UserControl.getUserByName(nome)
            const userEmail = await UserControl.getUserByEmail(email)
            if (userName) {
                throw new Error('Nome de usuário já cadastrado')
            } else if (userEmail) {
                throw new Error('Email já cadastrado')
            } else {
                const userData = {
                    nome,
                    email,
                    password: await bcrypt.hash(password, 10),
                    ultimoIp
                }
                const UserInstance = await User.create(userData)
                const token = UserControl.gerarToken(UserInstance)

                res.status(201).json({
                    msg: 'Usuário cadastrado e logado com sucesso!',
                    token: token
                });
            }

        } catch (error) {
            if (error.message === 'Nome de usuário já cadastrado' || error.message === 'Email já cadastrado') {
                res.status(409).json({ error: error.message })
            } else if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message })
            } else {
                res.status(500).json({ error: 'Erro interno do servidor' })
            }
        }
    },

    async login(req, res) {
        // #swagger.tags = ['Auth']
        const { login, password } = req.body;
        try {
            let user
            if (login.includes('@')) {
                user = await UserControl.getUserByEmail(login);
            } else {
                user = await UserControl.getUserByName(login);
            }

            if (user) {
                const senha_ok = await bcrypt.compare(password, user.password);
                if (senha_ok) {
                    const token = UserControl.gerarToken(user)

                    const tokenInvalidExists = await UserControl.getToken(token)
                    if (tokenInvalidExists) {
                        return res.status(400).json({ msg: 'Token já está inválido' });
                    }

                    return res.status(200).json({ msg: "Usuário logado com sucesso!", token: token });
                } else {
                    return res.status(400).json({ error: "Login ou Senha incorretos!" });
                }
            } else {
                return res.status(404).json({ error: "Usuário não encontrado!" });
            }
        } catch (error) {
            return res.status(400).json(error);
        }
    },

    async logout(req, res) {
        // #swagger.tags = ['Auth']
        try {
            const { authorization } = req.headers;
            if (!authorization) {
                return res.status(400).json({ msg: "Token não fornecido" });
            }

            const token = authorization.split(' ')[1];
            const tokenInvalidExists = await UserControl.getToken(token);

            if (!tokenInvalidExists) {
                await Tokens.create({
                    token
                });
            }

            res.status(200).json({ msg: "Logout realizado com sucesso!" })

        } catch (error) {
            return res.status(500).json({ msg: "Erro ao processar logout", erro: error.message });
        }
    },

    async forget(req, res) {
        // #swagger.tags = ['User']
        // #swagger.security = [{ "Bearer": [] }]
        const { email } = req.body;

        try {
            const user = await UserControl.getUserByEmail(email)
            if (!user) {
                throw new Error('Email não encontrado');
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: '30m',
                subject: String(user.id),
                issuer: 'forget',
                audience: 'users'
            });

            const mailOptions = {
                from: '"Projeto WEB 3" <noreply@ifthreads.com>',
                to: user.email,
                subject: 'Recuperação de senha',
                html: `
                    <p>Olá ${user.nome},</p>
                    <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
                    <a href="${process.env.CLIENT_URL}/reset?token=${token}">Redefinir senha</a>
                    <p>Se você não solicitou essa recuperação, ignore este email.</p>
                `
            };

            await smtpTransporter.sendMail(mailOptions)

            await Tokens.create({ token })

            return res.json({ success: true, message: 'Email de recuperação enviado com sucesso' });
        } catch (error) {
            return res.status(500).json({ msg: `Erro ao enviar email de recuperação de senha: ${error.message}` });
        }
    },

    //arquivo nesta função
    async update(req, res) {
        // #swagger.tags = ['User']
        // #swagger.security = [{ "Bearer": [] }]
        // #swagger.parameters['id'] = { description: 'ID do usuário' }
        const { id } = req.params;
        const userLogged = req.user;
        const { nome, email } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (!userLogged || id != userLogged.id) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        try {
            const UserInstance = await User.findByPk(userLogged.id);
            if (!UserInstance) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const updatedData = {};
            if (nome) {
                const userName = await UserControl.getUserByName(nome)
                if (!userName) {
                    updatedData.nome = nome;
                } else {
                    return res.status(400).json({ msg: "Nome de usuário já cadastrado" })
                }
            }
            if (email) {
                const userEmail = await UserControl.getUserByEmail(email)
                if (!userEmail) {
                    updatedData.email = email
                } else {
                    return res.status(400).json({ msg: "Email já cadastrado" })
                }
            }

            updatedData.ip = ip;

            await UserInstance.update(updatedData, {
                where: {
                    id: userLogged.id
                }
            });

            res.sendStatus(204)

        } catch (error) {
            res.status(500).json({
                error: 'Erro ao atualizar User - ' + error.message,
                name: error.name,
                stack: error.stack
            });
        }
    },

    async reset(req, res) {
        // #swagger.tags = ['User']
        const { token } = req.params
        const { newPassword } = req.body

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
                issuer: 'forget',
                audience: 'users'
            });

            const user = await User.findByPk(decodedToken.id);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const tokenRecord = await UserControl.getToken(token);
            if (!tokenRecord) {
                throw new Error('Token inválido ou expirado');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await user.update({ password: hashedPassword });

            await tokenRecord.destroy();

            return res.json({ success: true, message: 'Senha redefinida com sucesso' });
        } catch (error) {
            return res.status(500).json({ success: false, message: `Erro ao redefinir senha: ${error.message}` });
        }
    },

    async delete(req, res) {
        // #swagger.tags = ['User']
        // #swagger.security = [{ "Bearer": [] }]
        const { id } = req.body;

        const UserInstance = await User.findByPk(id);
        try {

            if (!UserInstance) {
                return req.status(404).json({
                    error: 'Não existe a User'
                })
            }
            await UserInstance.destroy();
            res.status(201).json({ message: 'User deletado' });
        } catch (error) {
            res.status(500).json({
                error: 'erro ao deletar - ' + error.message,
                name: error.name,
                stack: error.stack
            })
        }
    }
}

module.exports = UserControl;