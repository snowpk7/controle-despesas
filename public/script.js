// public/script.js (app)
const lista = document.getElementById("lista-despesas");
const form = document.getElementById("form-despesa");
const sound = document.getElementById("sound");
const userNameEl = document.getElementById("userName");
const btnLogout = document.getElementById("btnLogout");

const USERS = [
  { name: "Arthur Soares", password: "160825" },
  { name: "Paulo Soares", password: "160825" },
  { name: "Rhuan Pablo", password: "160825" },
  { name: "Vanderlei Soares", password: "160825" }
];

// obter info do usuário
async function loadUser() {
  try {
    const res = await fetch("/me");
    if (!res.ok) {
      window.location.href = "/login.html";
      return;
    }
    const json = await res.json();
    userNameEl.textContent = json.user.name;
  } catch (err) {
    console.error(err);
    window.location.href = "/login.html";
  }
}

// carregar despesas
async function carregarDespesas() {
  const res = await fetch("/api/despesas");
  if (!res.ok) {
    // possivelmente não autenticado
    window.location.href = "/login.html";
    return;
  }
  const despesas = await res.json();
  lista.innerHTML = "";
  if (!despesas.length) {
    lista.innerHTML = `<li class="despesa-item"><div>Nenhuma despesa ainda</div></li>`;
    return;
  }

  despesas
    .slice() // copia
    .reverse() // mostrar mais recentes primeiro
    .forEach(d => {
      const item = document.createElement("li");
      item.className = "despesa-item";
      item.innerHTML = `
        <div class="item-meta">
          <strong>${escapeHtml(d.descricao)}</strong>
          <small>R$ ${Number(d.valor).toFixed(2)} • ${new Date(d.data).toLocaleString()} • <em>${escapeHtml(d.criadoPor||"—")}</em></small>
        </div>
        <div class="item-actions">
          <button class="btn-excluir" data-id="${d.id}">Excluir</button>
        </div>
      `;
      lista.appendChild(item);
    });

  // attach listeners
  document.querySelectorAll(".btn-excluir").forEach(b => {
    b.addEventListener("click", async (ev) => {
      const id = ev.currentTarget.getAttribute("data-id");
      if (!confirm("Deseja mesmo excluir essa despesa?")) return;
      await fetch(`/api/despesas/${id}`, { method: "DELETE" });
      await carregarDespesas();
    });
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const descricao = document.getElementById("descricao").value.trim();
  const valor = document.getElementById("valor").value;
  if (!descricao || valor === "") return alert("Preencha descrição e valor");
  // enviar
  const res = await fetch("/api/despesas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao, valor })
  });
  if (!res.ok) {
    const err = await res.json();
    return alert(err.error || "Erro ao adicionar");
  }
  sound.play();
  form.reset();
  await carregarDespesas();
});

// logout
btnLogout.addEventListener("click", async () => {
  await fetch("/logout", { method: "POST" });
  window.location.href = "/login.html";
});

// helper de segurança básica
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// inicialização
(async function init() {
  await loadUser();
  await carregarDespesas();
  // atualizar a cada 12s
  setInterval(carregarDespesas, 12000);
})();