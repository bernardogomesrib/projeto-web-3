const Sequelize = require('sequelize');


const sequelize = new Sequelize('sequelize','aluno','ifpecjbg',{
    dialect : 'mysql',
    host: 'localhost'
});


sequelize.authenticate()
.then(()=> {
    console.log('Conectado no banco de dados');
})
.catch((err)=>{
    console.error('erro ao conectar no banco de dados - '+err.message)
});


module.exports = sequelize;