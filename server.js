const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const FILE_PATH = 'despesas.json';

// Rota para obter todas as despesas
app.get('/despesas', (req, res) => {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Erro ao ler arquivo');
        res.send(JSON.parse(data));
    });
});

// Rota para adicionar uma despesa
app.post("/api/despesas", (req, res) => {
  const { descricao, valor } = req.body;
  if (!descricao || !valor) {
    return res.status(400).json({ error: "Descrição e valor são obrigatórios" });
  }

  const despesas = lerDespesas();

  const novaDespesa = {
    id: Date.now(), // gera um ID único baseado no timestamp
    descricao,
    valor: parseFloat(valor),
    data: new Date().toISOString()
  };

  despesas.push(novaDespesa);
  salvarDespesas(despesas);

  res.json(novaDespesa);
});

// Rota para apagar dispesas
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


app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
