const mysql = require('mysql');
const config = require('../conf/db').mysql;

// 创建数据路连接池
const pool = mysql.createPool(config);
module.exports = pool;