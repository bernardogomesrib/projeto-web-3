const sequelize = require('../db/db')
const { DataTypes } = require('sequelize')
const Tokens = sequelize.define('tokens', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

module.exports = Tokens