const Thread  = require("../entities/Thread")
const ThreadControl = {
    async getAll(req,res){
        try {
            res.json(await Thread.findAll())
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao buscar os Threads - '+error.message,
                name:error.name,
                stack: error.stack
            })
        }
    },

    async getById(req,res){
        const {id} = req.params;
        try {
            return res.json(await Thread.findByPk(id));
        } catch (error) {
            res.status(500).json({error: 'Erro ao procurar Thread - '+error.message})
        }
    },
    
    // arquivo nesta função
    async save(req,res){
        const {titulo,mensagem,arquivo} = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const ThreadInstance = await Thread.create({
                titulo,mensagem,arquivo
            })
            res.json(ThreadInstance);
        } catch (error) {
            res.status(500).json({
                error:'Erro ao salvar Thread - '+ error.message,
                name:error.name,
                stack: error.stack
            })
        }
    },

    //arquivo nesta função
    async update(req,res){
        const {id,titulo,mensagem,arquivo} = req.body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const ThreadInstance = await Thread.findByPk(id);
            if(!ThreadInstance){
                return res.status(404).json({
                    error: 'Thread não encontrado'
                });
            }
    
            await ThreadInstance.update({ titulo,mensagem,arquivo });
            res.json(ThreadInstance);
    
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao atualizar Thread - ' + error.message,
                name: error.name,
                stack: error.stack
            });
        }
    },
    
    async delete(req,res){
        const {id}= req.body;

        const ThreadInstance = await Thread.findByPk(id);
        try {
            
            if(!ThreadInstance){
                return req.status(404).json({
                    error:'Não existe a Thread'
                })
            }
            await ThreadInstance.destroy();
            res.status(201).json({message :'Thread deletado'});
        } catch (error) {
            res.status(500).json({error:'erro ao deletar - '+error.message,
            name:error.name,
            stack: error.stack})
        }
    }
}

module.exports = ThreadControl;