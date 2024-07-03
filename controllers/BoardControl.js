const Board  = require("../entities/Board")
const BoardControl = {
    async getAll(req,res){
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
        const {id} = req.params;
        try {
            return res.json(await Board.findByPk(id));
        } catch (error) {
            res.status(500).json({error: 'Erro ao procurar board - '+error.message})
        }
    },
    async save(req,res){
        const {mensagem,nome,id} = req.body;

        try {
            const boardInstance = await Board.create({
                mensagem,nome,id
            })
            res.json(boardInstance);
        } catch (error) {
            res.status(500).json({
                error:'Erro ao salvar board - '+ error.message,
                name:error.name,
                stack: error.stack
            })
        }
    },
    async update(req,res){
        const {id,mensagem,nome} = req.body
        try {
            const boardInstance = await Board.findByPk(id);
            if(!boardInstance){
                return res.status(404).json({
                    error: 'board não encontrado'
                });
            }
    
            await boardInstance.update({ mensagem, nome });
            res.json(boardInstance);
    
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao atualizar board - ' + error.message,
                name: error.name,
                stack: error.stack
            });
        }
    },
    
    async delete(req,res){
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