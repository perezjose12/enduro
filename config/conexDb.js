const mysql = require("mysql");

const conex = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"db_clubenduro"
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