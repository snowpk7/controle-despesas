const form = document.getElementById('expenseForm');
const tableBody = document.getElementById('expenseTable').querySelector('tbody');
const sound = document.getElementById('sound');

// Carrega todas as despesas
async function loadExpenses() {
    const res = await fetch('/despesas');
    const despesas = await res.json();
    tableBody.innerHTML = '';
    despesas.forEach(d => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${d.nome}</td><td>${d.descricao}</td><td>R$ ${d.valor}</td><td>${d.data}</td>`;
        tableBody.appendChild(row);
    });
}

// Enviar nova despesa
form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const data = document.getElementById('data').value;

    const res = await fetch('/despesas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nome, descricao, valor, data })
    });

    const result = await res.json();
    if(res.ok){
        loadExpenses();
        sound.play();
        form.reset();
    } else {
        alert(result);
    }
});

function carregarDespesas() {
  fetch("/api/despesas")
    .then(res => res.json())
    .then(despesas => {
      listaDespesas.innerHTML = "";
      despesas.forEach(d => {
        const li = document.createElement("li");
        li.className = "flex justify-between items-center bg-gray-100 p-2 rounded mb-2";

        li.innerHTML = `
          <span>${d.descricao} - R$ ${d.valor.toFixed(2)} (${new Date(d.data).toLocaleDateString()})</span>
          <button onclick="deletarDespesa(${d.id})" class="bg-red-500 text-white px-3 py-1 rounded">Excluir</button>
        `;

        listaDespesas.appendChild(li);
      });
    });
}

function deletarDespesa(id) {
  fetch(`/api/despesas/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(() => carregarDespesas());
}


// Atualiza tabela a cada 10 segundos
loadExpenses();
setInterval(loadExpenses, 10000);