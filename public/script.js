const form = document.getElementById("form-despesa");
const listaDespesas = document.getElementById("lista-despesas");

// Carregar despesas ao abrir página
document.addEventListener("DOMContentLoaded", carregarDespesas);

// Enviar nova despesa
form.addEventListener("submit", e => {
  e.preventDefault();
  const descricao = document.getElementById("descricao").value;
  const valor = document.getElementById("valor").value;

  fetch("/api/despesas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao, valor })
  })
    .then(res => res.json())
    .then(() => {
      form.reset();
      carregarDespesas();
    });
});

// Carregar despesas da API
function carregarDespesas() {
  fetch("/api/despesas")
    .then(res => res.json())
    .then(despesas => {
      listaDespesas.innerHTML = "";
      despesas.forEach(d => {
        const li = document.createElement("li");
        li.className = "despesa-item";

        li.innerHTML = `
          <span>${d.descricao} - R$ ${d.valor.toFixed(2)} <small>(${new Date(d.data).toLocaleDateString()})</small></span>
          <button onclick="deletarDespesa(${d.id})" class="btn-excluir">Excluir</button>
        `;

        listaDespesas.appendChild(li);
      });
    });
}

// Excluir despesa
function deletarDespesa(id) {
  fetch(`/api/despesas/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(() => carregarDespesas());
}
