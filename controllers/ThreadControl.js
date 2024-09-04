const { Op } = require("sequelize");
const Clicks = require("../entities/Clicks");
const Thread = require("../entities/Thread");
const Board = require("../entities/Board");
const Answer = require("../entities/Answer");

const ThreadControl = {
    async getAll(req, res) {
        // #swagger.tags = ['Thread']
        const { page, size } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const sizeNumber = 20;
        try {
            res.json(
                await Thread.findAll({
                    limit: sizeNumber,
                    offset: (pageNumber - 1) * sizeNumber,
                })
            );
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
            const { filters } = req.params;
            const threads = await Thread.findAll({
                where: {
                    [Op.or]: [
                        {
                            titulo: {
                                [Op.like]: `%${filters}%`,
                            },
                        },
                        {
                            mensagem: {
                                [Op.like]: `%${filters}%`,
                            },
                        },
                    ],
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
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
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
            res.status(500).json({
                error: "Erro ao procurar Thread - " + error.message,
            });
        }
    },

    async save(req, res) {
        /*  #swagger.tags = ['Thread']
            #swagger.security = [{ "Bearer": [] }]
            #swagger.consumes = ['multipart/form-data']
            #swagger.parameters['board'] = { description: 'ID do board', required: true }
            #swagger.parameters['image'] = {
                in: 'formData',
                type: 'file',
                required: false,
                description: 'Arquivo de imagem'
            }
            #swagger.parameters['titulo'] = {
                in: 'formData',
                type: 'string',
                required: true,
                description: 'Título da thread'
            }
            #swagger.parameters['mensagem'] = {
                in: 'formData',
                type: 'string',
                required: true,
                description: 'Mensagem da thread'
            }
        */
        const board = req.params.board;
        const user = req.user;
        const { titulo, mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        try {
            const boardId = await Board.findByPk(board);
            if (!boardId) {
                return res.status(404).json({
                    error: "Board não encontrado",
                });
            }
            const threadData = {
                titulo,
                mensagem,
                arquivo,
                ip,
                boardId: board,
            };
            if (user) {
                threadData.userId = user.id;
                threadData.userName = user.nome;
            }
            const ThreadInstance = await Thread.create(threadData);
            res.json(ThreadInstance);
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
                    titulo: title,
                },
            });
        } catch (error) {
            throw new Error(
                "Erro ao buscar thread pelo titulo " + error.message
            );
        }
    },

    async saveAnonymous(req, res) {
        /*  #swagger.tags = ['Thread']
            #swagger.consumes = ['multipart/form-data']
            #swagger.parameters['board'] = { description: 'ID do board', required: true }
            #swagger.parameters['image'] = {
                in: 'formData',
                type: 'file',
                required: false,
                description: 'Arquivo de imagem'
            }
            #swagger.parameters['titulo'] = {
                in: 'formData',
                type: 'string',
                required: true,
                description: 'Título da thread'
            }
            #swagger.parameters['mensagem'] = {
                in: 'formData',
                type: 'string',
                required: true,
                description: 'Mensagem da thread'
            }
        */
        const board = req.params.board;
        const user = req.user;
        const { titulo, mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        try {
            const boardId = await Board.findByPk(board);
            if (!boardId) {
                return res.status(404).json({
                    error: "Board não encontrado",
                });
            }
            const threadData = {
                titulo,
                mensagem,
                arquivo,
                ip,
                boardId: board,
            };
            if (user) {
                threadData.userId = user.id;
                threadData.userName = user.nome;
            }
            const ThreadInstance = await Thread.create(threadData);
            res.json(ThreadInstance);
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
                    titulo: title,
                },
            });
        } catch (error) {
            throw new Error(
                "Erro ao buscar thread pelo titulo " + error.message
            );
        }
    },

    async updateThread(req, res) {
        /*  #swagger.tags = ['Thread']
            #swagger.consumes = ['multipart/form-data']
            #swagger.security = [{ "Bearer": [] }]
            #swagger.parameters['id'] = { description: 'ID da thread', required: true }
            #swagger.parameters['image'] = {
                in: 'formData',
                type: 'file',
                required: false,
                description: 'Arquivo de imagem'
            }
            #swagger.parameters['titulo'] = {
                in: 'formData',
                type: 'string',
                required: false,
                description: 'Título da thread'
            }
            #swagger.parameters['mensagem'] = {
                in: 'formData',
                type: 'string',
                required: false,
                description: 'Mensagem da thread'
            }
        */
        const { id } = req.params;
        const { titulo, mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const userLogged = req.user;

        try {
            const ThreadInstance = await Thread.findByPk(id);
            if (!ThreadInstance) {
                return res.status(404).json({ error: "Thread não encontrada" });
            }

            if (ThreadInstance.userId !== userLogged.id) {
                return res.status(401).json({ msg: "Unauthorized" });
            }

            const updatedData = {};
            if (titulo) {
                const titleExist = await ThreadControl.getByTitle(titulo);
                if (!titleExist) {
                    updatedData.titulo = titulo;
                } else {
                    return res
                        .status(400)
                        .json({ msg: "Titulo da thread já existe!" });
                }
            }

            if (mensagem) {
                updatedData.mensagem = mensagem;
            }

            if (arquivo) {
                updatedData.arquivo = arquivo;
            }

            updatedData.ip = ip;

            await ThreadInstance.update(updatedData, {
                where: {
                    id,
                },
            });

            res.sendStatus(204);
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
                return res.status(404).json({ error: "Não existe a Thread" });
            }
            await ThreadInstance.destroy();
            res.status(201).json({ message: "Thread deletada" });
        } catch (error) {
            res.status(500).json({
                error: "Erro ao deletar - " + error.message,
                name: error.name,
                stack: error.stack,
            });
        }
    },

    async getThreadsByBoard(req, res) {
        /*  #swagger.tags = ['Thread']
            #swagger.description = 'Retorna todas as threads de um board específico (Utilizando o ID da board).'
            #swagger.parameters['boardId'] = {
                in: 'path',
                description: 'ID do board',
                required: true,
                type: 'string'
            }
            #swagger.responses[200] = {
                description: 'Lista das threads do board.'
            }
            #swagger.responses[500] = {
                description: 'Erro ao buscar threads do board.'
            }
        */
        const boardId = req.params.boardId;
        try {
            const threads = await Thread.findAll({
                where: { boardId: boardId },
            });
            res.status(200).json(threads);
        } catch (error) {
            res.status(500).json({
                message: "Erro ao buscar threads do board",
                error,
            });
        }
    },

    async getRecentThreads(_, res) {
        /*  #swagger.tags = ['Thread']
            #swagger.description = 'Retorna uma lista das 10 threads mais recentes, ordenadas pela data de criação em ordem decrescente.'
            #swagger.responses[200] = {
                description: 'Lista das threads mais recentes.'
            }
            #swagger.responses[404] = {
                description: 'Nenhuma thread encontrada!'
            }
            #swagger.responses[500] = {
                description: 'Erro ao buscar threads mais recentes.'
            }
        */
        try {
            console.log('Buscando threads mais recentes...');
            const recentThreads = await Thread.findAll({
                order: [["createdAt", "DESC"]],
                limit: 10,
            });

            console.log('Número de threads encontradas:', recentThreads.length);

            if (recentThreads.length === 0) {
                return res
                    .status(404)
                    .json({ msg: "Nenhuma thread encontrada!" });
            }

            res.status(200).json(recentThreads);
        } catch (error) {
            res.status(500).json({
                message: "Erro ao buscar threads mais recentes",
                error,
            });
        }
    },

    async getThreadContent(req, res) {
        /*  #swagger.tags = ['Thread']
            #swagger.description = 'Uma thread contendo suas respostas'
        */
        const { boardId, threadId } = req.params;
        try {
            const threadDetails = await Thread.findOne({
                where: { id: threadId, boardId: boardId },
                include: [{
                    model: Answer,
                    as: 'answers'
                }]
            });

            if (!threadDetails) {
                return res.status(404).json({ message: 'Thread não encontrado' });
            }

            res.json(threadDetails);
        } catch (error) {
            res.status(500).json({ error: `Aconteceu um erro: ${error}` });
        }
    },

};

module.exports = ThreadControl;
