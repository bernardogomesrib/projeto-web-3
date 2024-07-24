const { Op } = require("sequelize");
const Clicks = require("../entities/Clicks");
const Thread = require("../entities/Thread");
const Board = require("../entities/Board");
const { off } = require("../config/nodemailerConfig");

const ThreadControl = {

    async getAll(req, res) {
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
        try {
            const { pesquisa } = req.query
            const threads = await Thread.findAll({
                where: {
                    [Op.or]: [
                        {
                            titulo: {
                                [Op.like]: `%${pesquisa}%`
                            }
                        },
                        {
                            mensagem: {
                                [Op.like]: `%${pesquisa}%`
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

    // arquivo nesta função
    async save(req, res) {
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

    //arquivo nesta função
    async update(req, res) {
        const { id, titulo, mensagem, arquivo } = req.body;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        try {
            const ThreadInstance = await Thread.findByPk(id);
            if (!ThreadInstance) {
                return res.status(404).json({
                    error: "Thread não encontrado",
                });
            }

            await ThreadInstance.update({ titulo, mensagem, arquivo });
            res.json(ThreadInstance);
        } catch (error) {
            res.status(500).json({
                error: "Erro ao atualizar Thread - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },

    async delete(req, res) {
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
