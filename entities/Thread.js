const sequelize = require('../db/db');
const { DataTypes } = require("sequelize");
const Thread = sequelize.define('thread',{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey:true
    },
    titulo:{
        type: DataTypes.STRING(255),
        allowNull: false
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
    clicks:{
        type: DataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false
    },
    userName:{
        type: DataTypes.STRING(255),
        allowNull: true,
    },
})
module.exports = Thread;