require('dotenv').config()
const express = require('express');
const Sequelize = require('./db/db');
const router = require('./routes/Routes');

const app = express();

// Middleware para fazer o parsing do corpo da solicitação JSON
app.use(express.json());

// Rotas
app.use(router);

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
