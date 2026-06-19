// =====================================
// IMPORTAÇÕES - O que usamos neste projeto
// =====================================
// Express: cria o servidor web
const express = require("express");
// CORS: permite que o frontend acesse o backend de domínios diferentes
const cors = require("cors");
// Bcrypt: criptografa as senhas (deixa segura)
const bcrypt = require("bcrypt");
// Crypto: gera IDs únicos para as sessões de login
const crypto = require("crypto");
// Banco de dados SQLite
const db = require("./db");

// Cria o servidor Express
const app = express();
// Define a porta onde o servidor vai rodar (3000)
const PORT = 3000;

// Configura o Express para entender JSON nas requisições
app.use(express.json());
// Permite requisições de outros domínios (importante para segurança)
app.use(cors());
// Define a pasta "public" como acessível publicamente (HTML, CSS, JS)
app.use(express.static("public"));

// =====================================
// CRIAÇÃO DO BANCO DE DADOS
// =====================================
// db.serialize() executa tudo em ordem, esperando terminar cada comando
db.serialize(() => {

  // Cria a tabela USUARIOS se não existir
  // id: número único que aumenta sozinho
  // usuario: nome do usuário (UNIQUE = não pode repetir)
  // senha: senha criptografada do usuário
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE,
      senha TEXT
    )
  `);

  // Cria a tabela JOGOS se não existir
  // id: número único que aumenta sozinho
  // jogo: nome do jogo (Elden Ring, GTA, etc)
  // plataforma: em que consola/PC é (PS5, Xbox, PC, etc)
  db.run(`
    CREATE TABLE IF NOT EXISTS jogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jogo TEXT,
      plataforma TEXT
    )
  `);

  console.log("✅ Banco de dados criado e pronto!");
});

// =====================================
// ARMAZENAMENTO DE SESSÕES
// =====================================
// Objeto que guarda os usuários logados
// Chave: token único | Valor: dados do usuário
// Exemplo: { "abc123": { usuario: "João" }, "def456": { usuario: "Maria" } }
const sessions = {};

// =====================================
// REGISTRO - Criar nova conta
// =====================================
// POST /register - recebe dados do frontend e cria novo usuário
app.post("/register", async (req, res) => {

  // Pega o usuário e senha enviados pelo frontend
  const { usuario, senha } = req.body;

  // Verifica se o usuário digitou o usuário E a senha
  // Se deixar em branco, retorna erro
  if (!usuario || !senha) {
    return res.json({ ok: false, erro: "Campos obrigatórios" });
  }

  try {
    // Criptografa a senha para guardar com segurança no banco
    // 10 é o "nível" de segurança (quanto maior, mais difícil quebrar)
    // await: espera terminar antes de continuar
    const hash = await bcrypt.hash(senha, 10);

    // Insere o novo usuário no banco de dados
    // ?, ? = valores que vão ser substituídos por [usuario, hash]
    // Isso previne "SQL injection" (ataque hackers)
    db.run(
      "INSERT INTO usuarios (usuario, senha) VALUES (?, ?)",
      [usuario, hash],
      function (err) {

        // Se houver erro (ex: usuário já existe), avisa
        if (err) {
          return res.json({ ok: false, erro: "Usuário já existe" });
        }

        // Sucesso! Usuário criado
        res.json({ ok: true });
      }
    );

  } catch (e) {
    // Se algo der errado, retorna o erro
    res.status(500).json({ ok: false, erro: e.message });
  }
});

// =====================================
// MIDDLEWARE DE AUTENTICAÇÃO
// =====================================
// Middleware = função que verifica algo antes de fazer a ação
// Todas as rotas que precisam de login usam este "auth"
function auth(req, res, next) {

  // Pega o token (sessionId) do cabeçalho da requisição
  // O frontend envia assim: Authorization: "abc123"
  const token = req.headers.authorization;

  // Verifica se o token existe E se está na lista de sessões válidas
  if (!token || !sessions[token]) {
    // Se não tiver token ou for inválido, retorna erro "não autenticado"
    return res.status(401).json({ erro: "Não autenticado" });
  }

  // ✅ Token é válido! Adiciona os dados do usuário à requisição
  // Assim, as funções que vêm depois podem saber quem é o usuário
  req.user = sessions[token];

  // Continua para a próxima função (permite seguir)
  next();
}

// =====================================
// LOGIN - Entrar na conta
// =====================================
// POST /login - recebe usuário e senha, cria sessão se correto
app.post("/login", (req, res) => {

  // Pega os dados enviados pelo frontend
  const { usuario, senha } = req.body;

  // Procura o usuário no banco de dados
  // SELECT * = pega tudo | WHERE usuario = ? = mas só esse usuário
  db.get(
    "SELECT * FROM usuarios WHERE usuario = ?",
    [usuario],
    async (err, user) => {

      // Verifica se houve erro na busca
      if (err) return res.status(500).json({ ok: false, erro: err.message });

      // Se o usuário não foi encontrado
      if (!user) {
        return res.json({ ok: false, erro: "Usuário não encontrado" });
      }

      // Compara a senha digitada com a senha criptografada do banco
      // bcrypt.compare: verifica se a senha está correta de forma segura
      const ok = await bcrypt.compare(senha, user.senha);

      // Se a senha for incorreta
      if (!ok) {
        return res.json({ ok: false, erro: "Senha incorreta" });
      }

      // ✅ SUCESSO! Agora cria uma sessão para este usuário

      // Gera um ID único para a sessão (tipo um "crachá de entrada")
      // Exemplo: "550e8400-e29b-41d4-a716-446655440000"
      const sessionId = crypto.randomUUID();

      // Armazena a sessão no objeto sessions
      // Próximas vezes que o cliente enviar este token, ele será reconhecido
      sessions[sessionId] = { usuario: user.usuario };

      // Envia o token para o frontend guardar no localStorage
      res.json({ ok: true, sessionId });
    }
  );
});

// =====================================
// CRUD - OPERAÇÕES COM JOGOS
// =====================================
// CRUD = Create, Read, Update, Delete (criar, ler, editar, deletar)

// ===== READ - Pegar lista de jogos =====
// GET /api/jogos - retorna todos os jogos
// "auth" = precisa estar logado para acessar
app.get("/api/jogos", auth, (req, res) => {

  // Pega TODOS (*) os jogos da tabela
  db.all("SELECT * FROM jogos", [], (err, rows) => {

    // Se houver erro, retorna
    if (err) return res.status(500).json({ erro: err.message });

    // Sucesso! Envia a lista de jogos em JSON
    // rows = array com todos os jogos
    res.json(rows);
  });
});

// ===== CREATE - Adicionar novo jogo =====
// POST /api/jogos - cria um novo jogo
app.post("/api/jogos", auth, (req, res) => {

  // Pega o nome do jogo e plataforma do corpo da requisição
  const { jogo, plataforma } = req.body;

  // Insere um novo registro na tabela jogos
  db.run(
    "INSERT INTO jogos (jogo, plataforma) VALUES (?, ?)",
    [jogo, plataforma],
    function (err) {

      if (err) return res.status(500).json({ erro: err.message });

      // Retorna o jogo criado com seu ID (gerado automaticamente)
      // this.lastID = ID do último registro inserido
      res.json({
        id: this.lastID,
        jogo,
        plataforma
      });

    }
  );
});

// ===== UPDATE - Editar jogo existente =====
// PUT /api/jogos/5 - edita o jogo com ID 5
app.put("/api/jogos/:id", auth, (req, res) => {

  // Pega o nome e plataforma novos
  const { jogo, plataforma } = req.body;
  // Pega o ID do jogo que quer editar (vem da URL)
  // /api/jogos/5 -> id = 5
  const id = req.params.id;

  // UPDATE = altera um registro
  // SET = muda esses campos
  // WHERE id = ? = mas só o registro com esse ID
  db.run(
    "UPDATE jogos SET jogo = ?, plataforma = ? WHERE id = ?",
    [jogo, plataforma, id],
    function (err) {

      if (err) return res.status(500).json({ erro: err.message });

      // this.changes = quantas linhas foram alteradas
      // Se nenhuma foi alterada, significa que o ID não existe
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Não encontrado" });
      }

      // Sucesso!
      res.json({ ok: true });

    }
  );
});

// ===== DELETE - Deletar jogo =====
// DELETE /api/jogos/5 - deleta o jogo com ID 5
app.delete("/api/jogos/:id", auth, (req, res) => {

  // Pega o ID do jogo que quer deletar
  const id = req.params.id;

  // DELETE = remove um registro
  // WHERE id = ? = só o registro com esse ID
  db.run(
    "DELETE FROM jogos WHERE id = ?",
    [id],
    function (err) {

      if (err) return res.status(500).json({ erro: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ erro: "Não encontrado" });
      }

      res.json({ ok: true });

    }
  );
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
});