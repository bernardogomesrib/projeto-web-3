require('dotenv').config()
const express = require('express');
const Sequelize = require('./db/db');
const swaggerUI = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const router = require('./routes/Routes');
const cors = require('cors')
const app = express();

app.use(cors())
// Middleware para fazer o parsing do corpo da solicitação JSON
app.use(express.json());

// Rotas
app.use(router);

// Configuração do Swagger
app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

// Inicie o servidor
app.listen(3000, () => {
    console.log("Servidor está rodando na porta 3000");
});

// Sincronize o banco de dados
Sequelize.sync()
    .then(() => {
        console.log('Banco de dados sincronizado');
    })
    .catch((err) => {
        console.error('Erro ao sincronizar o banco de dados:', err.message);
    });
