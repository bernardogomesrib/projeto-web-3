const Answer = require("../entities/Answer");
const Thread = require("../entities/Thread");
const { saveAnonymous } = require("./ThreadControl");


const AnswerControl = {
    async getAll(req, res) {
        // #swagger.tags = ['Answer']
        try {
            res.json(await Answer.findAll())
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao buscar as respostas - ' + error.message
            })
        }
    },

    async getById(req, res) {
        // #swagger.tags = ['Answer']
        const { id } = req.params;
        try {
            return res.json(await Answer.findByPk(id));
        } catch (error) {
            res.status(500).json({ error: 'Erro ao procurar resposta - ' + error.message })
        }
    },

    async save(req, res) {
        /* #swagger.tags = ['Answer']
            #swagger.security = [{ "Bearer": [] }]
            #swagger.consumes = ['multipart/form-data']
            #swagger.parameters['boardId'] = { description: 'ID da board', required: true }
            #swagger.parameters['threadId'] = { description: 'ID da thread', required: true }
            #swagger.parameters['image'] ={
                in: 'formData',
                type: 'file',
                required: false,
                description: 'Arquivo de imagem'
            }
           #swagger.parameters['mensagem'] = {
                in: 'formData',
                type: 'string',
                required: false,
                description: 'Resposta de uma thread'
            }  
        */
        const { boardId, threadId } = req.params;
        const { mensagem } = req.body;
        const user = req.user;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const thread = await Thread.findOne({ where: { id: threadId, boardId: boardId } });
            if (!thread) {
                return res.status(404).json({ message: 'ERRO: Thread não encontrada' });
            }

            const userId = req.user ? req.user.id : null;

            const answer = await Answer.create({
                mensagem,
                arquivo,
                ip,
                threadId: threadId,
                userId:userId,
                userName: user.nome
            })

            console.log(user)
            return res.status(201).json(answer);
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao salvar resposta - ' + error.message,
                name: error.name,
                stack: error.stack
            })
        }
    },

    async saveAnonymous(req, res) {
        /* #swagger.tags = ['Answer']
            #swagger.consumes = ['multipart/form-data']
            #swagger.parameters['boardId'] = { description: 'ID da board', required: true }
            #swagger.parameters['threadId'] = { description: 'ID da thread', required: true }
            #swagger.parameters['image'] ={
                in: 'formData',
                type: 'file',
                required: false,
                description: 'Arquivo de imagem'
            }
           #swagger.parameters['mensagem'] = {
                in: 'formData',
                type: 'string',
                required: false,
                description: 'Resposta de uma thread'
            }  
        */
        const { boardId, threadId } = req.params;
        const { mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const thread = await Thread.findOne({ where: { id: threadId, boardId: boardId } });
            if (!thread) {
                return res.status(404).json({ message: 'ERRO: Thread não encontrada' });
            }

            const userId = req.user ? req.user.id : null;

            const answer = await Answer.create({
                mensagem,
                arquivo,
                ip,
                threadId: threadId,
                userId:userId,
                userName: "Anônimo"
            })

            return res.status(201).json(answer);
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao salvar resposta - ' + error.message,
                name: error.name,
                stack: error.stack
            })
        }
    },

    async update(req, res) {
        // #swagger.tags = ['Answer']
        /* #swagger.consumes = ['multipart/form-data']
            #swagger.parameters['image'] ={
                in: 'formData',
                type: 'file',
                required: false,
                description: 'Arquivo de imagem'
            }
           #swagger.parameters['mensagem'] = {
                in: 'formData',
                type: 'string',
                required: false,
                description: 'Resposta de uma thread'
            }
             
        */
        const { id } = req.params;
        const { mensagem } = req.body;
        const arquivo = req.file ? req.file.firebaseUrl : null;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        try {
            const answer = await Answer.findByPk(id);
            if (!answer) {
                return res.status(404).json({
                    error: 'Resposta não encontrada'
                });
            }

            const updatedData = {};
            if (mensagem) {
                updatedData.mensagem = mensagem;
            }

            if (arquivo) {
                updatedData.arquivo = arquivo;
            }

            updatedData.ip = ip;

            await answer.update(updatedData);

            res.sendStatus(204);
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao atualizar resposta - ' + error.message,
                name: error.name,
                stack: error.stack
            });
        }
    },

    async delete(req, res) {
        // #swagger.tags = ['Answer']
        // #swagger.security = [{ "Bearer": [] }]
        const { id } = req.body;

        const answer = await Answer.findByPk(id);
        try {
            if (!answer) {
                return req.status(404).json({
                    error: 'Não existe a resposta'
                })
            }
            await answer.destroy();
            res.status(201).json({ message: 'Resposta deletada' });
        } catch (error) {
            res.status(500).json({ error: 'erro ao deletar - ' + error.message })
        }
    }
}

module.exports = AnswerControl;
