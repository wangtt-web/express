const mysql = require("mysql2");
const config = requir('./sqlConfig.js')
const dbpool = {
  pool: {},
  config: config,
  create() {
    console.log("创建连接池");
    this.pool = mysql.createPool(this.config); //创建连接池
  },
  connect(sql, arr, fn) {
    this.pool.getConnection(function (err, connection) {
      /*发起query数据库语局
       * 1.SQL语局
       * 2.sql参数
       * 3.回调函数，执行完sql语句后调用，把结果注入在回调函数的参数里面，做出响应*/
      connection.execute(sql, arr, fn);

      //释放连接
      connection.release();
    });
  },
};
dbpool.create();
module.exports = dbpool;
