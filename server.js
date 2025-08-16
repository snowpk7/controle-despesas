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
app.post('/despesas', (req, res) => {
    const { nome, descricao, valor, data } = req.body;
    if (!nome || !descricao || !valor || !data) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Erro ao ler arquivo');
        const despesas = JSON.parse(data);
        despesas.push({ nome, descricao, valor, data });
        fs.writeFile(FILE_PATH, JSON.stringify(despesas, null, 2), err => {
            if (err) return res.status(500).send('Erro ao salvar despesa');
            res.send({ message: 'Despesa adicionada com sucesso' });
        });
    });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
