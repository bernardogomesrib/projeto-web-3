const Answer = require("../entities/Answer");

const AnswerControl = {
    async getAll(req,res){
        try {
            res.json(await Answer.findAll())
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao buscar as respostas - '+error.message
            })
        }
    },

    async getById(req,res){
        const {id} = req.params;
        try {
            return res.json(await Answer.findByPk(id));
        } catch (error) {
            res.status(500).json({error: 'Erro ao procurar resposta - '+error.message})
        }
    },

    //arquivo nesta função
    
    async save(req,res){
        const {mensagem,arquivo} = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const answer = await Answer.create({
                mensagem,
                arquivo,
                ip
            })
            return res.json(answer);
        } catch (error) {
            res.status(500).json({
                error:'Erro ao salvar resposta - '+ error.message,
                name:error.name,
                stack: error.stack
            })
        }
    },

    //arquivo nesta função
    async update(req,res){
        const{id,mensagem,arquivo}= req.body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const teste = await Answer.findByPk(id);
            if(!teste){
                return res.status(404).json({
                    error:'Resposta não encontrada'
                })
            }

            await teste.update({
                mensagem,arquivo,ip
            })
            res.json(teste);

        } catch (error) {
            res.status(500).json({
                error: 'Erro ao atualizar resposta - '+error.message
            })
        }
    },
    async delete(req,res){
        const {id}= req.body;

        const answer = await Answer.findByPk(id);
        try {
            
            if(!answer){
                return req.status(404).json({
                    error:'Não existe a resposta'
                })
            }
            await answer.destroy();
            res.status(201).json({message :'Resposta deletada'});
        } catch (error) {
            res.status(500).json({error:'erro ao deletar - '+error.message})
        }
    }
}

module.exports = AnswerControl;