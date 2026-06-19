// =====================================
// PÁGINA DO DASHBOARD - LISTA DE JOGOS
// =====================================
// Este arquivo cuida de: listar, adicionar, editar e deletar jogos
// Só quem tem token (está logado) consegue acessar

// =====================================
// PROTEÇÃO - SÓ ENTRA COM LOGIN
// =====================================

// Tenta pegar o token que foi salvo no login
// localStorage = memória do navegador que não apaga ao fechar
const token = localStorage.getItem("token");

// Se não tiver token, redireciona para login
// Assim evita que alguém acesse o dashboard sem estar logado
if (!token) {
  window.location.href = "index.html";
}

// ===== INICIALIZAÇÃO =====
// Ao abrir a página, carrega a lista de jogos
loadGames();

// ====================================
// CABEÇALHO DE AUTENTICAÇÃO
// ====================================
// Função que retorna o header necessário para requisições protegidas
// Toda requisição para /api/jogos precisa enviar o token
function headers() {
  return {
    "Content-Type": "application/json",
    // "Authorization": token envia o token ao servidor
    // O servidor verifica: "Este token existe? Este usuário é válido?"
    "Authorization": token
  };
}

// ====================================
// CARREGAR LISTA DE JOGOS
// ====================================
// Busca todos os jogos do banco de dados e mostra na tela
async function loadGames() {

  // Faz requisição GET para /api/jogos (pega dados do servidor)
  // headers() = envia o token de autenticação
  const res = await fetch("/api/jogos", {
    headers: headers()
  });

  // Se a requisição falhar (ex: token expirou, não autenticado)
  if (!res.ok) {
    alert("❌ Erro ao carregar jogos ou sessão expirada");
    logout(); // Faz logout automático
    return;
  }

  // Transforma a resposta em JSON
  // data = array de objetos como: [{ id: 1, jogo: "Elden Ring", plataforma: "PS5" }, ...]
  const data = await res.json();

  // Pega a div #list do HTML e preenche com os jogos
  // .map() = transforma cada jogo em HTML
  // .join("") = junta tudo em uma string
  // Resultado: <div class="item">...</div><div class="item">...</div>...
  list.innerHTML = data.map(j => `
    <div class="item">
      <div class="item-text">
        ${j.jogo} - ${j.plataforma}
      </div>
      <div class="item-actions">
        <!-- Botão Editar: clica e abre modal com os dados do jogo -->
        <button class="btn-edit" onclick="openEditModal(${j.id}, '${j.jogo}', '${j.plataforma}')">✏️ Editar</button>
        <!-- Botão Deletar: clica e deleta o jogo -->
        <button class="btn-delete" onclick="deleteGame(${j.id})">🗑️ Deletar</button>
      </div>
    </div>
  `).join("");
}

// ====================================
// ADICIONAR NOVO JOGO
// ====================================
// Função chamada quando clica no botão "Adicionar"
async function addGame() {

  // Verifica se os inputs foram preenchidos
  // Se algum tiver vazio (valor = ""), avisa e para
  if (!game.value || !platform.value) {
    alert("⚠️ Preencha todos os campos");
    return;
  }

  // Envia os dados para o servidor
  // POST = criar novo recurso
  // /api/jogos = rota que cria jogos
  const res = await fetch("/api/jogos", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      jogo: game.value,        // Exemplo: "Elden Ring"
      plataforma: platform.value // Exemplo: "PS5"
    })
  });

  // Recebe a resposta
  const data = await res.json();

  // Se deu erro, avisa
  if (!res.ok) {
    alert("❌ Erro ao adicionar jogo");
    return;
  }

  // ✅ Sucesso! Limpa os inputs e recarrega a lista
  game.value = "";           // Limpa input do jogo
  platform.value = "";       // Limpa input da plataforma
  loadGames();               // Atualiza a lista para mostrar o novo jogo
}

// ====================================
// EDIÇÃO - Abrir modal e salvar
// ====================================

// Variável para lembrar qual jogo está sendo editado
let editingGameId = null;

// Abre o modal para editar um jogo
// Recebe: id do jogo, nome do jogo, plataforma
function openEditModal(id, jogo, plataforma) {
  editingGameId = id;                    // Guarda qual jogo está editando
  editGame.value = jogo;                 // Preenche input com nome do jogo
  editPlatform.value = plataforma;       // Preenche input com plataforma
  editModal.classList.add("active");     // Mostra o modal (CSS display: flex)
}

// Fecha o modal sem salvar
function closeEditModal() {
  editModal.classList.remove("active");  // Esconde o modal
  editingGameId = null;                  // Limpa a variável
}

// Salva as alterações do jogo
async function updateGame() {

  // Se não tiver jogo selecionado, não faz nada
  if (!editingGameId) return;

  // Envia os dados editados para o servidor
  // PUT = atualizar recurso existente
  // /api/jogos/5 = atualiza o jogo com ID 5
  const res = await fetch(`/api/jogos/${editingGameId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      jogo: editGame.value,
      plataforma: editPlatform.value
    })
  });

  // Recebe a resposta
  const data = await res.json();

  // Se funcionou
  if (data.ok) {
    closeEditModal();   // Fecha o modal
    loadGames();        // Recarrega a lista para mostrar mudanças
  } else {
    alert("❌ Erro ao atualizar: " + data.erro);
  }
}

// ====================================
// DELETAR - Remover um jogo
// ====================================
async function deleteGame(id) {

  // Pede confirmação para o usuário
  // Se clicar em "Cancelar", a função retorna e não deleta
  if (!confirm("⚠️ Tem certeza que deseja deletar este jogo?")) {
    return;
  }

  // Envia requisição DELETE para o servidor
  // DELETE = remover recurso
  // /api/jogos/5 = deleta o jogo com ID 5
  const res = await fetch(`/api/jogos/${id}`, {
    method: "DELETE",
    headers: headers()
  });

  // Recebe a resposta
  const data = await res.json();

  // Se funcionou, recarrega a lista (sem o jogo deletado)
  if (data.ok) {
    loadGames();
  } else {
    alert("❌ Erro ao deletar: " + data.erro);
  }
}

// ====================================
// LOGOUT - Sair da conta
// ====================================
function logout() {
  // Remove o token da memória
  localStorage.removeItem("token");
  // Redireciona para login
  window.location.href = "index.html";
}
