const { Op } = require("sequelize");
const Clicks = require("../entities/Clicks");
const Thread = require("../entities/Thread");
const Board = require("../entities/Board");

const ThreadControl = {

    async getAll(req, res) {
        // #swagger.tags = ['Thread']
        const { page, size } = req.query
        const pageNumber = Math.max(1, Number(page) || 1);
        const sizeNumber = 20
        try {
            res.json(await Thread.findAll({
                limit: sizeNumber,
                offset: (pageNumber - 1) * sizeNumber,
            }));
        } catch (error) {
            res.status(500).json({
                error: "Erro ao buscar os Threads - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },

    async searchThreads(req, res) {
        // #swagger.tags = ['Thread']
        try {
            const { filters } = req.params
            const threads = await Thread.findAll({
                where: {
                    [Op.or]: [
                        {
                            titulo: {
                                [Op.like]: `%${filters}%`
                            }
                        },
                        {
                            mensagem: {
                                [Op.like]: `%${filters}%`
                            }
                        }
                    ]
                },
            });
            res.json(threads);
        } catch (error) {
            res.status(500).json({
                error: "Erro ao buscar os Threads - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },

    async getById(req, res) {
        // #swagger.tags = ['Thread']
        const { id } = req.params;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        try {
            const thread = await Thread.findByPk(id);
            if (!thread) {
                res.status(404).json({ msg: "Thread não existe!" });
            } else {
                const exists = await Clicks.findOne({
                    where: {
                        threadId: id,
                        ip: ip,
                    },
                });
                if (!exists) {
                    await Clicks.create({ threadId: id, ip: ip });
                    await Thread.update(
                        {
                            clicks: thread.clicks + 1,
                        },
                        {
                            where: {
                                id,
                            },
                        }
                    );
                    thread.clicks += 1;
                    return res.json(thread);
                }
                return res.json(thread);
            }
        } catch (error) {
            res
                .status(500)
                .json({ error: "Erro ao procurar Thread - " + error.message });
        }
    },

    async save(req, res) {
        // #swagger.tags = ['Thread']
        const board = req.params.board;
        const user = req.user;
        const { titulo, mensagem, arquivo } = req.body;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        try {
            const boardId = await Board.findByPk(board)
            if (!boardId) {
                return res.status(404).json({
                    error: "Board não encontrado",
                });
            }
            if (!user) {
                const ThreadInstance = await Thread.create({
                    titulo,
                    mensagem,
                    arquivo,
                    ip,
                    boardId: board,
                });
                res.json(ThreadInstance);
            } else {
                const ThreadInstance = await Thread.create({
                    titulo,
                    mensagem,
                    arquivo,
                    ip,
                    boardId: board,
                    userId: user.id,
                });
                res.json(ThreadInstance);
            }
        } catch (error) {
            res.status(500).json({
                error: "Erro ao salvar Thread - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },

    async getByTitle(title) {
        try {
            return await Thread.findOne({
                where: {
                    title
                }
            })
        } catch (error) {
            throw new Error('Erro ao buscar thread pelo titulo ' + error.message)
        }
    },

    async updateThread(req, res) {
        // #swagger.tags = ['Thread']
        // #swagger.security = [{ "Bearer": [] }]
        // #swagger.parameters['id'] = { description: 'ID da thread' }
        const { id } = req.params;
        const { titulo, mensagem, arquivo } = req.body;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const userLogged = req.user;

        try {
            const ThreadInstance = await Thread.findByPk(id);
            if (!ThreadInstance) {
                return res.status(404).json({ error: "Thread não encontrada" });
            }

            if (ThreadInstance.userId !== userLogged.id) {
                return res.status(401).json({ msg: "Unauthorized" });
            }

            const updatedData = {}
            if (titulo) {
                const titleExist = await ThreadControl.getByTitle(titulo)
                if(!titleExist){
                    updatedData.titulo = titulo
                } else {
                    return res.status(400).json({ msg: "Titulo da thread já existe!"})
                }
            }

            if (mensagem) {
                updatedData.mensagem = mensagem
            }

            if (arquivo) {
                updatedData.arquivo = arquivo
            }

            updatedData.ip = ip;

            await ThreadInstance.update(updatedData, {
                where: {
                    id
                }
            });

            res.sendStatus(204)
        } catch (error) {
            res.status(500).json({
                error: "Erro ao atualizar Thread - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },

    async delete(req, res) {
        // #swagger.tags = ['Thread']
        const { id } = req.body;

        const ThreadInstance = await Thread.findByPk(id);
        try {
            if (!ThreadInstance) {
                return req.status(404).json({
                    error: "Não existe a Thread",
                });
            }
            await ThreadInstance.destroy();
            res.status(201).json({ message: "Thread deletado" });
        } catch (error) {
            res.status(500).json({
                error: "erro ao deletar - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },
};

module.exports = ThreadControl;
