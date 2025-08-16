const form = document.getElementById("login-form");
const erroEl = document.getElementById("erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("usuario").value.trim();
  const password = document.getElementById("senha").value.trim();

  if (!name || !password) {
    erroEl.textContent = "Preencha usuário e senha!";
    return;
  }

  try {
    // envia para o backend
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password })
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      erroEl.textContent = json.error || "Usuário ou senha incorretos";
      return;
    }

    // login ok → redireciona para a página principal
    window.location.href = "/";
  } catch (err) {
    erroEl.textContent = "Erro de conexão";
    console.error(err);
  }
});

