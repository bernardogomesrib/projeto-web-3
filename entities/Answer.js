const sequelize = require('../db/db');
const { DataTypes } = require("sequelize");
const Answer = sequelize.define('answer',{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey:true
    },
    mensagem:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    arquivo:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip:{
        type: DataTypes.STRING(135),
        allowNull: false
    }
    
})

module.exports = Answer;