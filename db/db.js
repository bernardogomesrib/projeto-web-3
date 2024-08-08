const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: process.env.DB_DIALECT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
});

sequelize.authenticate()
.then(()=> {
    console.log('Conectado no banco de dados')
})
.catch((err)=>{
    console.error('erro ao conectar no banco de dados - '+err.message)
});


module.exports = sequelize;