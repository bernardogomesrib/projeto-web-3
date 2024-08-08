require('dotenv').config()
const express = require('express');
const Sequelize = require('./db/db');
const swaggerUI = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const router = require('./routes/Routes')
const cors = require('cors')
const app = express()

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(router);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.listen(3000, () => {
    console.log("Servidor está rodando na porta 3000");
});

Sequelize.sync({ force: false })
    .then(() => {
        console.log('Banco de dados sincronizado');
    })
    .catch((err) => {
        console.error('Erro ao sincronizar o banco de dados:', err.message)
    });
