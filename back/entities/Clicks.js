const sequelize = require('../db/db')
const { DataTypes } = require('sequelize')
const Clicks = sequelize.define('Clicks', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    threadId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ip: {
        type: DataTypes.STRING(135),
        allowNull: false,
    }
})

module.exports = Clicks