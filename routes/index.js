const express = require("express");
const link = require("../config/link");
const db = require("../config/conexDb");
const { error } = require("console");
const { Z_NO_FLUSH } = require("zlib");
const router = express.Router();

// Rutas para la pagina web
// Ruta para el inicio de la pagina
router.get("/", function (req, resp) {
  // Obtenemos los datos de la tbMoneda y de la tbCtasBancarias
  db.query("SELECT m.idMon, m.DesMon, m.AbrMon, b.idCtaBan, b.NomBan, b.NumTelf, b.CedBen, b.DtoCta FROM tbMoneda m LEFT JOIN tbCtasBancarias b ON m.idMon = b.idMon",
    (error, results) =>{
      if(error){
        console.error("Error al obtener los datos", error);
        return resp.render("index", {
          link,
          user: req.session.user || null,
          monedas: [],
          bancos: []
        });
      }

      const monedaMap = {};
      results.forEach(row => {
        if(!monedaMap[row.idMon]){
          monedaMap[row.idMon] = {
            idMon: row.idMon,
            DesMon: row.DesMon,
            AbrMon: row.AbrMon,
            bancos: []
          }
        }

        if (row.idCtaBan){
          monedaMap[row.idMon].bancos.push({
            idCtaBan: row.idCtaBan,
            NomBan: row.NomBan,
            NumTelf: row.NumTelf,
            CedBen: row.CedBen,
            DtoCta: row.DtoCta
          });
        }
      }); 

      const monedas = Object.values(monedaMap);

      resp.render("index", {
        link,
        user: req.session.user || null,
        monedas: monedas
      });
    }
    );
});

// Registrar movimiento (pago o gasto)
router.post("/registrar-movimiento", function (req, res) {
  // Verificar sesión
  if (!req.session.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { idMon, idCtaBan, MonMov, RefMov, FecMov, DesMov, tipMov } = req.body;
  
  // Validar que gastos solo los hagan administradores
  if (tipMov === 'G' && req.session.user.tipo !== 'A') {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const idMie = req.session.user.id;
  const query = `INSERT INTO tbMovimiento (
    idMie, idCtaBan, idMon, tipMov, MonMov, RefMov, FecMov, HoraReg, FecRegMov, DesMov, stsMov
  ) VALUES (?, ?, ?, ?, ?, ?, ?, CURTIME(), CURDATE(), ?, 'P')`;

  db.query(query, 
    [idMie, idCtaBan, idMon, tipMov, MonMov, RefMov, FecMov, DesMov],
    (error, results) => {
      if (error) {
        console.error("Error al registrar movimiento:", error);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      res.json({ success: true });
    }
  );
});

// Ruta para la parte de contacto de la pagina
router.get("/contacto", function (req, res) {
  res.render("contacto", { link, user: req.session.user || null });
});

// Ruta para el historial de movimientos
router.get("/historial", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/log_in");
  }

  // Consulta para obtener movimientos
  const query = `
    SELECT 
      m.idMov,
      mi.NomApe AS nombreUsuario,
      mi.MailUsu AS emailUsuario,
      m.TipMov,
      m.MonMov,
      mon.AbrMon AS abreviaturaMoneda,
      m.RefMov,
      DATE_FORMAT(m.FecRegMov, '%d/%m/%Y') AS FecRegMov,
      TIME_FORMAT(m.HoraReg, '%h:%i %p') AS HoraReg,
      DATE_FORMAT(m.FecMov, '%d/%m/%Y') AS FecMov,
      m.DesMov,
      m.stsMov,
      v.stsValMov,
      IFNULL(vm.NomUsu, '') AS validador
    FROM tbMovimiento m
    JOIN tbMiembros mi ON m.idMie = mi.idMie
    JOIN tbMoneda mon ON m.idMon = mon.idMon
    LEFT JOIN tbValMovimiento v ON m.idMov = v.idMov
    LEFT JOIN tbMiembros vm ON v.idMie = vm.idMie
    ORDER BY m.FecRegMov DESC, m.HoraReg DESC
  `;

  db.query(query, (error, movimientos) => {
    if (error) {
      console.error("Error al obtener movimientos:", error);
      return res.render("historial", {
        link,
        user: req.session.user,
        movimientos: [],
        error: "Error al cargar movimientos"
      });
    }

    res.render("historial", {
      link,
      user: req.session.user,
      movimientos: movimientos
    });
  });
});

// Ruta para validar/rechazar movimientos
router.post("/movimiento/validar", function(req, res) {
  if (!req.session.user || req.session.user.tipo !== 'A') {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { idMov, accion } = req.body;
  const idMie = req.session.user.id;
  const stsValMov = accion === 'validar' ? 'V' : 'R';
  const stsMov = accion === 'validar' ? 'A' : 'R';

  // Iniciar transacción
  db.beginTransaction(function(err) {
    if (err) { 
      return res.status(500).json({ error: "Error en servidor" });
    }

    // 1. Actualizar estado en tbMovimiento
    db.query(
      "UPDATE tbMovimiento SET stsMov = ? WHERE idMov = ?",
      [stsMov, idMov],
      function(error, result) {
        if (error) {
          return db.rollback(function() {
            res.status(500).json({ error: "Error al actualizar movimiento" });
          });
        }

        // 2. Insertar registro en tbValMov
        db.query(
          `INSERT INTO tbValMovimiento (idMov, idMie, FecVal, HoraVal, stsValMov) 
          VALUES (?, ?, CURDATE(), CURTIME(), ?)`,
          [idMov, idMie, stsValMov],
          function(error, result) {
            if (error) {
              return db.rollback(function() {
                res.status(500).json({ error: "Error al registrar validación" });
              });
            }

            // Commit de la transacción
            db.commit(function(err) {
              if (err) {
                return db.rollback(function() {
                  res.status(500).json({ error: "Error en transacción" });
                });
              }
              res.json({ success: true });
            });
          }
        );
      }
    );
  });
});

// Ruta para el historial de miembros
router.get("/historialMie", function (req, res) {
  // Verificar sesión y tipo de usuario
  if (!req.session.user || req.session.user.tipo !== "A") {
    return res.redirect("/?error=Acceso_denegado");
  }

  // Obtener los miembros de la tbMiembros de la BD
  db.query(
    "SELECT idMie, NomApe, MailUsu, NomUsu, TipUsu, StsUsu, DATE_FORMAT(FecReg, '%d/%m/%Y') as NewFecReg, TIME_FORMAT(HoraReg, '%h:%i %p') as NewHoraReg FROM tbMiembros",
    (error, results)=>{
        if(error){
            console.error("Error al obtener los miembros", error);
            return res.render("historialMie", {
                link, 
                user: req.session.user,
                error: "Error al cargar los miembros"
            });
        }

        res.render("historialMie", {
            link,
            user: req.session.user,
            miembros: results
        });
    }
  );
});

// Actualizar el estado
router.post("/actualizarEstadoMiembro", function(req, res) {
    if (!req.session.user || req.session.user.tipo !== 'A') {
        return res.status(403).json({ error: "Acceso denegado" });
    }

    const { idMie, StsUsu } = req.body;
    
    db.query(
        "UPDATE tbMiembros SET StsUsu = ? WHERE idMie = ?",
        [StsUsu, idMie],
        (error, result) => {
            if (error) {
                console.error("Error al actualizar estado:", error);
                return res.status(500).json({ error: "Error en servidor" });
            }
            res.json({ success: true });
        }
    );
});

// Ruta para el log in
router.get("/log_in", function (req, res) {
  res.render("log_in", {
    link,
    error: req.query.error,
    success: req.query.success,
  });
});

// Procedimiento para traer los datos de la BD al formulario de Mi Perfil
router.get("/profile", function (req, res) {
  // Validar que el usuario esta logeado
  if (!req.session.user) {
    return res.redirect("/log_in");
  }

  const userId = req.session.user.id;

  db.query(
    "SELECT * FROM tbMiembros WHERE idMie = ?",
    [userId],
    (error, result) => {
      if (error) {
        console.error("Error al obtener los datos del perfil", error);
        return res.redirect("/?error=Perfil");
      }

      if (result.length === 0) {
        return res.redirect("/log_in");
      }

      const userData = result[0];

      res.render("profile", {
        link,
        user: req.session.user || null,
        userData: userData,
        error: req.query.error,
        success: req.query.success,
      });
    }
  );
});

// Actualizar datos de perfil
router.post("/profile/update", function (req, res) {
  // Verificar sesión activa
  if (!req.session.user) {
    return res.redirect("/log_in");
  }

  const userId = req.session.user.id;
  const { NumTelf, MailUsu, NomUsu, PasUsu, NewPasUsu } = req.body;
  const currentUsername = req.session.user.nombre; // Nombre actual en sesión

  // Validar coincidencia de contraseñas si se proporcionan
  if (PasUsu && PasUsu !== NewPasUsu) {
    return res.redirect("/profile?error=Las contraseñas no coinciden");
  }

  // Verificar si el nombre de usuario cambió y si ya existe
  if (NomUsu !== currentUsername) {
    db.query(
      "SELECT idMie FROM tbMiembros WHERE NomUsu = ? AND idMie != ?",
      [NomUsu, userId],
      (error, results) => {
        if (error) {
          console.error("Error al verificar nombre de usuario:", error);
          return res.redirect("/profile?error=Error del servidor");
        }

        if (results.length > 0) {
          return res.redirect(
            "/profile?error=El nombre de usuario ya está en uso"
          );
        }

        // Si no existe, proceder con la actualización
        profileUpdate();
      }
    );
  } else {
    // Si el nombre no cambió, actualizar directamente
    profileUpdate();
  }

  // Función para realizar la actualización
  function profileUpdate() {
    // Preparar campos a actualizar
    const updateFields = {
      NumTelf: NumTelf,
      MailUsu: MailUsu,
      NomUsu: NomUsu,
    };

    // Agregar contraseña solo si se proporciona una nueva
    if (PasUsu) {
      updateFields.PasUsu = PasUsu;
    }

    // Construir la consulta dinámicamente
    const setClause = Object.keys(updateFields)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = [...Object.values(updateFields), userId];

    // Ejecutar actualización
    db.query(
      `UPDATE tbMiembros SET ${setClause} WHERE idMie = ?`,
      values,
      (error, result) => {
        if (error) {
          console.error("Error al actualizar perfil:", error);
          return res.redirect("/profile?error=Error al actualizar");
        }

        // Actualizar nombre de usuario en sesión si cambió
        if (NomUsu !== currentUsername) {
          req.session.user.nombre = NomUsu;
        }

        res.redirect("/profile?success=Perfil actualizado");
      }
    );
  }
});

// Ruta para mostrar el fomrulario de login
router.get("/sign_in", function (req, res) {
  res.render("sign_in", {
    link,
    error: req.query.error,
    success: req.query.success,
  });
});

// Procedimiento para realizar registros en la tbMiembros
router.post("/sign_in", (req, res) => {
  const { NomApe, CedMie, NumTelf, MailUsu, NomUsu, PasUsu } = req.body;
  
  // Generar fecha y hora actuales
  const now = new Date();
  const FecReg = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const HoraReg = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS

  db.query(
    "SELECT * FROM tbMiembros WHERE NomUsu = ? OR CedMie = ? OR MailUsu = ?",
    [NomUsu, CedMie, MailUsu],
    (error, results) => {
      if (error) {
        console.error("Error en la consulta SELECT:", error);
        return res.redirect("/sign_in?error=General");
      }

      if (results.length > 0) {
        // Verificación simplificada
        if (results.some(result => result.CedMie === CedMie)) {
          return res.redirect("/sign_in?error=Cedula_Existente");
        }
        if (results.some(result => result.NomUsu === NomUsu)) {
          return res.redirect("/sign_in?error=Usuario_Existente");
        }
        return res.redirect("/sign_in?error=Mail_Existente");
      }

      // Consulta INSERT corregida (10 placeholders)
      db.query(
        `INSERT INTO tbMiembros 
        (NomApe, CedMie, NumTelf, MailUsu, NomUsu, PasUsu, FecReg, HoraReg, TipUsu, StsUsu) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          NomApe,
          CedMie,
          NumTelf,
          MailUsu,
          NomUsu,
          PasUsu,
          FecReg,    
          HoraReg,   
          "U", // Tipo usuario
          "P"  // Estado Pendiente
        ],
        (error, insertResults) => {
          if (error) {
            console.error("Error en la consulta INSERT:", error);
            return res.redirect("/sign_in?error=General");
          }
          res.redirect("/log_in?success=Registro_Exitoso");
        }
      );
    }
  );
});

// Procedimiento para validar los usuarios de la tbMiembros para el login
router.post("/log_in", (req, res) => {
  const { NomUsu, PasUsu } = req.body;

  db.query(
    "SELECT * FROM tbMiembros WHERE NomUsu = ? AND StsUsu = 'A'",
    [NomUsu],
    (error, results) => {
      if (error) {
        console.error("Error al iniciar sesion", error);
        return res.redirect("/log_in?error=General");
      }

      if (results.length === 0) {
        return res.redirect("/log_in?error=Credenciales_invalidas");
      }

      const usuario = results[0];

      if (PasUsu === usuario.PasUsu) {
        req.session.user = {
          id: usuario.idMie,
          nombre: usuario.NomUsu,
          tipo: usuario.TipUsu,
        };
        res.redirect("/");
      } else {
        res.redirect("/log_in?error=Credenciales_invalidas");
      }
    }
  );
});

// Procedimiento para el logOut
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
    }
    res.redirect("/");
  });
});
module.exports = router;
