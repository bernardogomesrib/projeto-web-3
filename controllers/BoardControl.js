const Board  = require("../entities/Board")
const BoardControl = {
    async getAll(req,res){
        // #swagger.tags = ['Board']
        try {
            res.json(await Board.findAll())
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao buscar os boards - '+error.message,
                name:error.name,
                stack: error.stack
            })
        }
    },

    async getById(req,res){
        // #swagger.tags = ['Board']
        const {id} = req.params;
        try {
            return res.json(await Board.findByPk(id));
        } catch (error) {
            res.status(500).json({error: 'Erro ao procurar board - '+error.message})
        }
    },

    async save(req,res){
        // #swagger.tags = ['Board']
        // #swagger.security = [{ "Bearer": [] }]
        const {mensagem,nome,id} = req.body

        const board = await Board.findByPk(id)

        try {
            if(board){
                return res.status(400).json({
                    error:'board já existe'
                })
            }
            const boardInstance = await Board.create({
                mensagem,nome,id
            })
            res.json(boardInstance)
        } catch (error) {
            res.status(500).json({
                error:'Erro ao salvar board - '+ error.message,
                name:error.name,
                stack: error.stack
            })
        }
    },

    async update(req, res) {
        // #swagger.tags = ['Board']
        // #swagger.security = [{ "Bearer": [] }]
        const { id } = req.body;
        const { mensagem, nome } = req.body;

        try {
            const boardInstance = await Board.findByPk(id);
            if (!boardInstance) {
                return res.status(404).json({
                    error: 'Board não encontrado'
                });
            }

            const updatedData = {};
            if (mensagem) {
                updatedData.mensagem = mensagem;
            }

            if (nome) {
                updatedData.nome = nome;
            }

            await boardInstance.update(updatedData)

            res.sendStatus(204)

        } catch (error) {
            res.status(500).json({
                error: 'Erro ao atualizar Board - ' + error.message,
                name: error.name,
                stack: error.stack
            });
        }
    },
    
    async delete(req,res){
        // #swagger.tags = ['Board']
        // #swagger.security = [{ "Bearer": [] }]
        const {id}= req.body;

        const board = await Board.findByPk(id);
        try {
            
            if(!board){
                return req.status(404).json({
                    error:'Não existe a board'
                })
            }
            await board.destroy();
            res.status(201).json({message :'board deletado'});
        } catch (error) {
            res.status(500).json({error:'erro ao deletar - '+error.message,
            name:error.name,
            stack: error.stack})
        }
    }
}

module.exports = BoardControl;