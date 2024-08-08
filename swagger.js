const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
        title: "API IFThreads",
        description: 'Projeto para a disciplina de WEB 3'
    },
    host: process.env.API_URL,
    schemes: ['http'],
    securityDefinitions: {
        Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: "Header de autorização JWT usando o esquema Bearer. Exemplo: \"Bearer {token}\""
        }
    },
}

const outputFile = './swagger.json'
const endpointsFiles = ['./routes/Routes.js']

swaggerAutogen(outputFile, endpointsFiles, doc)
