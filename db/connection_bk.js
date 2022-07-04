const mysql = require("mysql");

/*
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "strative_assignments",
});
*/

const pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'strative_assignments',
    debug    :  false
});

/*
db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
*/

module.exports = {
    //db
    pool
};
