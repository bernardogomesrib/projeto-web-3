const sequelize = require('../db/db');
const { DataTypes } = require("sequelize");
const Answer = sequelize.define('answer',{
    id:{
        type:DataTypes.INTEGER,
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
    resolution: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ip:{
        type: DataTypes.STRING(135),
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING(135),
        allowNull: true,
    }
})

module.exports = Answer;