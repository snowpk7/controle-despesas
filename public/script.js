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

// Atualiza tabela a cada 10 segundos
loadExpenses();
setInterval(loadExpenses, 10000);