// server.js
const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "despesas.json");

// ---- Usuários fixos ----
const USERS = [
  { name: "Arthur Soares", password: "160825" },
  { name: "Paulo Soares", password: "160825" },
  { name: "Rhuan Pablo", password: "160825" },
  { name: "Vanderlei Soares", password: "160825" }
];

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "triomaq-secreta-muda-essa-em-produccao",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 horas
}));

// util: ler/salvar despesas
function lerDespesas() {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    const raw = fs.readFileSync(DB_PATH, "utf8");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro lendo despesas:", err);
    return [];
  }
}
function salvarDespesas(despesas) {
  fs.writeFileSync(DB_PATH, JSON.stringify(despesas, null, 2));
}

// middleware para proteger rotas API e app
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  // se for chamada de API, retornar 401; se for rota normal, redirecionar para login
  if (req.path.startsWith("/api/")) return res.status(401).json({ error: "Não autorizado" });
  return res.redirect("/login.html");
}

// ---- Rotas de autenticação ----

// login com fetch (POST JSON)
app.post("/login", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: "Campos obrigatórios" });

  const user = USERS.find(u => u.name === name && u.password === password);
  if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos" });

  req.session.user = { name: user.name };
  return res.json({ message: "ok", user: req.session.user });
});

// obter info do usuário logado
app.get("/me", (req, res) => {
  if (req.session && req.session.user) return res.json({ user: req.session.user });
  return res.status(401).json({ error: "Não autenticado" });
});

// logout
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Erro ao deslogar" });
    res.clearCookie("connect.sid");
    return res.json({ message: "Deslogado" });
  });
});

// ---- Rotas do app (protegidas) ----
// listar despesas
app.get("/api/despesas", requireAuth, (req, res) => {
  const d = lerDespesas();
  res.json(d);
});

// adicionar despesa
app.post("/api/despesas", requireAuth, (req, res) => {
  const { descricao, valor } = req.body;
  if (!descricao || (valor === undefined)) {
    return res.status(400).json({ error: "Descrição e valor são obrigatórios" });
  }

  const despesas = lerDespesas();
  const nova = {
    id: Date.now(),
    descricao: String(descricao),
    valor: parseFloat(valor),
    data: new Date().toISOString(),
    criadoPor: req.session.user.name
  };
  despesas.push(nova);
  salvarDespesas(despesas);
  return res.json(nova);
});

// deletar despesa
app.delete("/api/despesas/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const despesas = lerDespesas();
  const filtradas = despesas.filter(d => d.id !== id);
  if (filtradas.length === despesas.length) {
    return res.status(404).json({ error: "Despesa não encontrada" });
  }
  salvarDespesas(filtradas);
  return res.json({ message: "Removida" });
});

// Para qualquer GET / (raiz) ou /app, servir a página app se autenticado
app.get("/", (req, res) => {
  if (req.session && req.session.user) return res.sendFile(path.join(__dirname, "public", "app.html"));
  return res.sendFile(path.join(__dirname, "public", "login.html"));
});

// iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor TRIOMAQ rodando em http://localhost:${PORT}`);
});
