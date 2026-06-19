# 🎮 Game Hub

Aplicação web para gerenciar sua biblioteca de jogos com login seguro.

## 📋 Features

- ✅ **Autenticação segura** com criptografia bcrypt
- ✅ **CRUD completo** para gerenciar jogos
- ✅ **Gerenciamento de sessões** com tokens UUID
- ✅ **Interface limpa e responsiva**
- ✅ **Banco de dados SQLite**

## 🛠️ Tecnologias

| Backend | Frontend |
|---------|----------|
| Node.js + Express | HTML5 |
| SQLite | Vanilla JavaScript |
| Bcrypt (criptografia) | CSS3 |
| CORS | Fetch API |

## 📦 Instalação

```bash
cd minha-api
npm install
npm start
```

Acesse em `http://localhost:3000`

## 🗄️ Estrutura

```
minha-api/
├── server.js          # Rotas e autenticação
├── db.js              # Conexão SQLite
├── banco.db           # Banco de dados (criado automaticamente)
└── public/
    ├── index.html     # Login/Registro
    ├── dashboard.html # Gerenciador de jogos
    ├── app.js         # Lógica de autenticação
    ├── dashboard.js   # Lógica do dashboard
    └── style.css      # Estilos
```

## 🔐 Autenticação

1. **Registro**: Usuário criptografa e armazena no banco
2. **Login**: Valida credenciais e gera token UUID
3. **Sessão**: Token armazenado em memória no servidor
4. **Proteção**: Rotas `/api/jogos` requerem token válido no header `Authorization`

## 📡 Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/register` | Criar conta | ❌ |
| POST | `/login` | Fazer login | ❌ |
| GET | `/api/jogos` | Listar jogos | ✅ |
| POST | `/api/jogos` | Adicionar jogo | ✅ |
| PUT | `/api/jogos/:id` | Editar jogo | ✅ |
| DELETE | `/api/jogos/:id` | Deletar jogo | ✅ |

## 📝 Exemplo de Uso

### Criar conta
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"usuario":"joao","senha":"123456"}'
```

### Fazer login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"joao","senha":"123456"}'
# Retorna: {"ok":true,"sessionId":"550e8400-e29b-41d4-a716-446655440000"}
```

### Listar jogos
```bash
curl -X GET http://localhost:3000/api/jogos \
  -H "Authorization: 550e8400-e29b-41d4-a716-446655440000"
```

## 🔧 Dependências

```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "bcrypt": "^5.0.0",
  "sqlite3": "^5.1.0"
}
```

## 📄 Licença

MIT
