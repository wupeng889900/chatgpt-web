let mysql = require('mysql');
let connection = mysql.createPool({
	port: '3306',
	host: '144.202.115.251',
	user: 'sql_chatus_share',
	password: 'WYRnfaANfn5LRNPn',
	database: 'sql_chatus_share'
})
let sql=function (sql,callBack) {
	connection.query(sql,(err,data)=>{
		callBack(err,data)
	})
}

//数据连接配置
module.exports = {sql}
