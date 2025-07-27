const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

// Vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views")); // Esto es crucial

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: {secure:false}
}));

// Archivo Estaticos
app.use(express.static(path.join(__dirname, "src"))); 
app.use("/js", express.static(path.join(__dirname, "src/js")));
app.use("/css", express.static(path.join(__dirname, "src/css")));
app.use("/img", express.static(path.join(__dirname, "src/img")));

// Rutas
app.use("/", require("./routes/index"));

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
