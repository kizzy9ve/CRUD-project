const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./banco.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Banco conectado!");
  }
});

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS jogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jogo TEXT NOT NULL,
      plataforma TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE,
      senha TEXT
    )
  `);

  db.get(
    "SELECT * FROM usuarios WHERE usuario = ?",
    ["admin"],
    async (err, row) => {

      if (!row) {

        const hash = await bcrypt.hash(
          "123",
          10
        );

        db.run(
          "INSERT INTO usuarios (usuario, senha) VALUES (?, ?)",
          ["admin", hash]
        );

        console.log("Admin criado!");
      }
    }
  );

});

module.exports = db;