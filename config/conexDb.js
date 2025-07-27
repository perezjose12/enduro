const mysql = require("mysql");

const conex = mysql.createConnection({
    host:"sql10.freesqldatabase.com",
    user: "sql10792271",
    password: "AKqUrplB5A",
    database:"sql10792271"
});

conex.connect(function(err){
    if (err){
        throw err;
    }
    else{
        console.log("Conexion exitosa!!");
    }
});

module.exports = conex;
