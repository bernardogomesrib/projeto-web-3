const Board = require("../entities/Board");
const { Sequelize } = require("sequelize");

const BoardControl = {
  async getAll(req, res) {
    // #swagger.tags = ['Board']
    try {
      res.json(await Board.findAll());
    } catch (error) {
      res.status(500).json({
        error: "Erro ao buscar os boards - " + error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  },

  async getById(req, res) {
    // #swagger.tags = ['Board']
    const { id } = req.params;
    try {
      return res.json(await Board.findByPk(id));
    } catch (error) {
      res.status(500).json({
        error: "Erro ao procurar board - " + error.message,
      });
    }
  },

  async save(req, res) {
    /*
        #swagger.tags = ['Board']
        #swagger.security = [{ "Bearer": [] }]
        #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['id'] = {
            in: 'formData',
            type: 'string',
            required: true,
            description: 'Id do board'
        }
        #swagger.parameters['nome'] = {
            in: 'formData',
            type: 'string',
            required: true,
            description: 'Nome do board'
        }
        #swagger.parameters['mensagem'] = {
            in: 'formData',
            type: 'string',
            required: true,
            description: 'Mensagem do board'
        }
        #swagger.parameters['image'] = {
            in: 'formData',
            type: 'file',
            required: false,
            description: 'Imagem do board'
        }
        #swagger.responses[200] = {
            description: 'Board criado com sucesso.'
        }
        #swagger.responses[400] = {
            description: 'Board já existe.'
        }
        #swagger.responses[500] = {
            description: 'Erro ao salvar board.'
        }  
     */
    const { mensagem, nome, id } = req.body;
    const image = req.file ? req.file.firebaseUrl : null;

    const board = await Board.findByPk(id);

    try {
      if (board) {
        return res.status(400).json({
          error: "board já existe",
        });
      }
      const boardInstance = await Board.create({
        mensagem,
        nome,
        image,
        id,
      });
      res.json(boardInstance);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao salvar board - " + error.message,
        name: error.name,
        stack: error.stack,
      });
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
          error: "Board não encontrado",
        });
      }

      const updatedData = {};
      if (mensagem) {
        updatedData.mensagem = mensagem;
      }

      if (nome) {
        updatedData.nome = nome;
      }

      await boardInstance.update(updatedData);

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao atualizar Board - " + error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  },

  async delete(req, res) {
    // #swagger.tags = ['Board']
    // #swagger.security = [{ "Bearer": [] }]
    const { id } = req.body;

    const board = await Board.findByPk(id);
    try {
      if (!board) {
        return req.status(404).json({
          error: "Não existe a board",
        });
      }
      await board.destroy();
      res.status(201).json({ message: "board deletado" });
    } catch (error) {
      res.status(500).json({
        error: "erro ao deletar - " + error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  },

  async getPopularBoards(_, res) {
    /*  #swagger.tags = ['Board']
            #swagger.description = 'Retorna uma lista dos 10 boards mais populares, baseados no número de threads e respostas associadas a eles.'
            #swagger.responses[200] = {
                description: 'Lista dos boards mais populares.'
            }
            #swagger.responses[500] = {
                description: 'Erro ao buscar boards mais populares.'
            }
        */
    try {
      const popularBoards = await Board.findAll({
        attributes: {
          include: [
            [
              Sequelize.literal(
                "(SELECT COUNT(*) FROM threads WHERE threads.boardId = board.id)"
              ),
              "threadCount",
            ],
          ],
        },
        order: [[Sequelize.literal("threadCount"), "DESC"]],
        limit: 10,
      });

      res.status(200).json(popularBoards);
    } catch (error) {
      console.error("Erro ao buscar boards mais populares:", error);
      res.status(500).json({
        message: "Erro ao buscar boards mais populares",
        error: error.message,
      });
    }
  },
};

module.exports = BoardControl;
