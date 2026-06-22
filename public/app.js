// =====================================
// PÁGINA DE LOGIN E REGISTRO
// =====================================
// Este arquivo cuida apenas do login/registro
// O dashboard ficou em outro arquivo (dashboard.js)

// ===== INICIALIZAÇÃO =====
// Quando abre a página, mostra o login
showLogin();

// ========================================
// NAVEGAÇÃO ENTRE TELAS (Login ↔ Registro)
// ========================================

// Mostra a tela de login
function showLogin() {
  setScreen("login");
}

// Mostra a tela de registro
function showRegister() {
  setScreen("register");
}

// Muda qual tela está visível
// Tira "active" de todas as telas
// Depois adiciona "active" apenas a uma
function setScreen(id) {

  // Pega TODAS as divs com classe "screen"
  // .forEach = para cada uma
  document.querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));

  // Agora adiciona "active" apenas à tela desejada
  // Isso a deixa visível (por causa do CSS)
  document.getElementById(id).classList.add("active");
}

// ====================================
// LOGIN - Fazer login
// ====================================
async function login() {

  // Pega o que foi digitado nos inputs
  // loginUser = input do usuário
  // loginPass = input da senha
  const usuario = loginUser.value;
  const senha = loginPass.value;

  // Faz uma requisição POST para o servidor
  // POST = enviar dados (não apenas receber)
  // "/login" = vai para a rota POST /login no servidor
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // body = os dados que está enviando (em JSON)
    body: JSON.stringify({ usuario, senha })
  });

  // Transforma a resposta em JSON
  const data = await res.json();
  console.log(data);

  // Se não funcionou (data.ok = false), mostra o erro
  if (!data.ok) {
    msgLogin.innerText = data.erro;
    return;
  }

  // ✅ LOGIN FUNCIONOU!
  // Guarda o token na memória do navegador (localStorage)
  // localStorage = guarda dados mesmo se fechar a página
  localStorage.setItem("token", data.sessionId);
  
  // Redireciona para o dashboard
  // window.location.href = muda a página do navegador
  window.location.href = "dashboard.html";
}

// ====================================
// REGISTRO - Criar nova conta
// ====================================
async function register() {

  // Pega o que foi digitado
  const usuario = regUser.value;
  const senha = regPass.value;

  // Envia para o servidor para criar a conta
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha })
  });

  // Recebe a resposta
  const data = await res.json();

  // Mostra mensagem de sucesso ou erro
  // Se ok = true, mostra "Criado! Faça login agora."
  // Se ok = false, mostra a mensagem de erro
  msgRegister.innerText = data.ok ? "✅ Criado! Faça login agora." : data.erro;
}