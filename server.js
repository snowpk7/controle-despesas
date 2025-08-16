const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "despesas.json");

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Funções utilitárias
function lerDespesas() {
  if (!fs.existsSync(DB_PATH)) return [];
  const data = fs.readFileSync(DB_PATH);
  return JSON.parse(data);
}

function salvarDespesas(despesas) {
  fs.writeFileSync(DB_PATH, JSON.stringify(despesas, null, 2));
}

// 📌 Rota: listar todas as despesas
app.get("/api/despesas", (req, res) => {
  res.json(lerDespesas());
});

// 📌 Rota: adicionar nova despesa
app.post("/api/despesas", (req, res) => {
  const { descricao, valor } = req.body;
  if (!descricao || !valor) {
    return res.status(400).json({ error: "Descrição e valor são obrigatórios" });
  }

  const despesas = lerDespesas();
  const novaDespesa = {
    id: Date.now(), // ID único
    descricao,
    valor: parseFloat(valor),
    data: new Date().toISOString()
  };

  despesas.push(novaDespesa);
  salvarDespesas(despesas);

  res.json(novaDespesa);
});

// 📌 Rota: excluir despesa
app.delete("/api/despesas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let despesas = lerDespesas();

  const despesasFiltradas = despesas.filter(d => d.id !== id);

  if (despesas.length === despesasFiltradas.length) {
    return res.status(404).json({ error: "Despesa não encontrada" });
  }

  salvarDespesas(despesasFiltradas);
  res.json({ message: "Despesa removida com sucesso" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});