const mysql = require("mysql2/promise");
const config = require("../utils/config.js");

const mysqlConfig = {
    host: config["MYSQL"].HOST,
    port: config["MYSQL"].PORT,
    user: config["MYSQL"].USER,
    password: config["MYSQL"].PASSWORD,
    database: config["MYSQL"].DATABASE,
    connectionLimit: 10,
}
const connection = mysql.createPool(mysqlConfig);

module.exports = connection;