const sequelize = require('../db/db');
const { DataTypes } = require("sequelize");
const User = sequelize.define('user',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    nome:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    tipo: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    ultimoIp:{
        type: DataTypes.STRING(135),
        allowNull: false,
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false
    }
    
})
module.exports = User;