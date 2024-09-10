const { Op } = require("sequelize");
const Clicks = require("../entities/Clicks");
const Thread = require("../entities/Thread");
const redis = require('redis');
const { extractResolution } = require('../utils/fileUtils');

const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT

const client = redis.createClient({
    url: `redis://${redisHost}:${redisPort}`
});

client.on('error', (err) => {
    console.error('Erro ao conectar ao Redis:', err);
});

(async () => {
    await client.connect();
})();

const CACHE_KEY = 'recent_threads';

const ThreadControl = {

    async getAll(req, res) {
        // #swagger.tags = ['Thread']

        const pageNumber = Number(req.query.page) || 1;
        const sizeNumber = Number(req.query.size) || 20;

        try {
            const threads = await Thread.findAll({
                limit: sizeNumber,
                offset: (pageNumber - 1) * sizeNumber,
            });

            const totalThreads = await Thread.count();

            const totalPages = Math.ceil(totalThreads / sizeNumber);

            const nextPage =
                pageNumber < totalPages
                    ? `${process.env.CLIENT_URL}/threads?page=${pageNumber + 1}&size=${sizeNumber}`
                    : null;
            const previousPage =
                pageNumber > 1
                    ? `${process.env.CLIENT_URL}/threads?page=${pageNumber - 1}&size=${sizeNumber}`
                    : null;

            res.json({
                data: threads,
                currentPage: pageNumber,
                totalPages: totalPages,
                next: nextPage,
                previous: previousPage,
            });
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
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        try {
            const thread = await Thread.findOne({
                where: { id },
                include: [
                    {
                        model: Answer,
                        as: 'answers',
                    }
                ],
            });

            if (!thread) {
                return res.status(404).json({ msg: "Thread não existe!" });
            }

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
                        where: { id },
                    }
                );
                thread.clicks += 1;
            }

            res.json(thread);
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
        const { boardId } = req.params;
        const { titulo, mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const user = req.user;

        try {
            let resolution = null;
            if (req.file) {
                resolution = await extractResolution(req.file);
            }

            const threadData = {
                titulo,
                mensagem,
                arquivo,
                resolution,
                ip,
                boardId: boardId,
                userId: user ? user.id : null,
                userName: user ? user.nome : 'Anônimo'
            };

            const ThreadInstance = await Thread.create(threadData);
            res.json(ThreadInstance);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao salvar Thread - ' + error.message });
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
        const { boardId } = req.params;
        const { titulo, mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        try {
            let resolution = null;
            if (req.file) {
                resolution = await extractResolution(req.file);
            }

            const threadData = {
                titulo,
                mensagem,
                arquivo,
                resolution,
                ip,
                boardId: boardId,
                userName: 'Anônimo'
            };

            const ThreadInstance = await Thread.create(threadData);
            res.json(ThreadInstance);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao salvar Thread anonimamente - ' + error.message });
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
        // #swagger.security = [{ "Bearer": [] }]
        const { id } = req.body;

        try {
            const ThreadInstance = await Thread.findByPk(id);
            if (!ThreadInstance) {
                return res.status(404).json({ error: "Não existe a Thread" });
            }

            // Deletar a thread do banco de dados
            await ThreadInstance.destroy();

            // Remover a chave do cache no Redis
            const CACHE_KEY = 'recent_threads'; // A chave que usamos para armazenar threads recentes
            await client.del(CACHE_KEY);

            // Retorna uma resposta de sucesso
            res.status(201).json({ message: "Thread deletada e cache atualizado" });
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
            const cachedData = await client.get(CACHE_KEY);

            if (cachedData) {
                const parsedData = JSON.parse(cachedData);

                return res.status(200).json(parsedData);
            } else {
                // Se não houver cache, faz a busca no banco de dados
                const recentThreads = await Thread.findAll({
                    order: [["createdAt", "DESC"]],
                    limit: 10,
                });

                if (recentThreads.length === 0) {
                    return res.status(404).json({ msg: "Nenhuma thread encontrada!" });
                }

                await client.setEx(CACHE_KEY, 60, JSON.stringify(recentThreads));

                res.status(200).json(recentThreads);
            }
        } catch (error) {
            res.status(500).json({
                message: "Erro ao buscar threads mais recentes",
                error,
            });
        }
    },
};

module.exports = ThreadControl;
