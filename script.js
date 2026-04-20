// ── STATE (simula banco MySQL – substitua por fetch/axios na integração real) ──
const DB = {
  clientes: [
    {
      cpf: "123.456.789-00",
      nome: "João da Silva",
      telefone: "(11) 91234-5678",
    },
    {
      cpf: "987.654.321-00",
      nome: "Maria Oliveira",
      telefone: "(11) 99876-5432",
    },
  ],
  pets: [
    {
      id: 1,
      animal: "Cachorro",
      nome: "Rex",
      raca: "Labrador",
      dono_cpf: "123.456.789-00",
    },
    {
      id: 2,
      animal: "Gato",
      nome: "Mimi",
      raca: "Persa",
      dono_cpf: "987.654.321-00",
    },
  ],
  produtos: [
    { id: 1, nome: "Ração Premium 5kg", preco: 89.9, estoque: 30 },
    { id: 2, nome: "Shampoo Pet 500ml", preco: 24.5, estoque: 15 },
    { id: 3, nome: "Coleira Ajustável M", preco: 35.0, estoque: 20 },
  ],
  compras: [
    {
      id: 1,
      cliente_cpf: "123.456.789-00",
      data: "2025-04-15",
      valor_total: 114.4,
      produtos: [
        { id: 1, nome: "Ração Premium 5kg", qtd: 1, valor: 89.9 },
        { id: 2, nome: "Shampoo Pet 500ml", qtd: 1, valor: 24.5 },
      ],
    },
    {
      id: 2,
      cliente_cpf: "987.654.321-00",
      data: "2025-04-18",
      valor_total: 35.0,
      produtos: [{ id: 3, nome: "Coleira Ajustável M", qtd: 1, valor: 35.0 }],
    },
  ],
};

// ── Helpers ──
const fmt = (v) => "R$ " + parseFloat(v).toFixed(2).replace(".", ",");
const fmtDate = (d) => new Date(d + "T00:00").toLocaleDateString("pt-BR");
const clienteNome = (cpf) => {
  const c = DB.clientes.find((c) => c.cpf === cpf);
  return c ? c.nome : cpf;
};
const nextId = (arr) =>
  arr.length ? Math.max(...arr.map((i) => i.id)) + 1 : 1;

// ── Toast ──
function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = (type === "success" ? "✅" : "❌") + " " + msg;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Navigation ──
function navigate(page, el) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");

  // Se não veio o elemento (clique no card ou logo), tenta achar no menu
  if (!el) {
    const items = document.querySelectorAll(".nav-item");
    items.forEach((item) => {
      if (item.getAttribute("onclick")?.includes(`'${page}'`)) {
        el = item;
      }
    });
  }

  if (el) el.classList.add("active");

  const config = {
    dashboard: { title: "Dashboard", icon: "📊" },
    clientes: { title: "Clientes", icon: "👤" },
    pets: { title: "Pets", icon: "🐶" },
    produtos: { title: "Produtos", icon: "🛒" },
    compras: { title: "Compras", icon: "💳" },
  };

  const info = config[page] || { title: page, icon: "🐾" };
  document.getElementById("topbarTitle").innerHTML =
    `${info.icon} <span>${info.title}</span>`;

  renderPage(page);
  closeSidebar();
}

// ── Sidebar ──
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("open");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("open");
}

// ── Modal ──
function openModal(id) {
  if (id === "modal-pet") populateDonoSelect();
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  // reset inputs
  document
    .getElementById(id)
    .querySelectorAll("input, select, textarea")
    .forEach((el) => {
      el.value = "";
    });
}

// ── Populate Dono Select ──
function populateDonoSelect() {
  const sel = document.getElementById("pet-dono");
  sel.innerHTML = '<option value="">Selecione o dono...</option>';
  DB.clientes.forEach((c) => {
    sel.innerHTML += `<option value="${c.cpf}">${c.nome} (${c.cpf})</option>`;
  });
}

// ── Render Pages ──
function renderPage(page) {
  if (page === "dashboard") renderDashboard();
  if (page === "clientes") renderClientes();
  if (page === "pets") renderPets();
  if (page === "produtos") renderProdutos();
  if (page === "compras") renderCompras();
}

function renderDashboard() {
  document.getElementById("dash-clientes").textContent = DB.clientes.length;
  document.getElementById("dash-pets").textContent = DB.pets.length;
  document.getElementById("dash-produtos").textContent = DB.produtos.length;
  document.getElementById("dash-compras").textContent = DB.compras.length;

  const cont = document.getElementById("dash-recent-compras");
  const recent = [...DB.compras].reverse().slice(0, 5);
  if (!recent.length) {
    cont.innerHTML =
      '<div class="empty-state"><div class="icon">💳</div><p>Sem compras ainda</p></div>';
    return;
  }
  cont.innerHTML = recent.map((c) => compraCard(c)).join("");
}

function compraCard(c) {
  const prods = c.produtos
    .map((p) => `<span class="badge badge-orange">${p.nome} x${p.qtd}</span>`)
    .join("");
  return `
    <div class="compra-card">
      <div class="compra-info">
        <h4>💳 Compra #${c.id} — ${clienteNome(c.cliente_cpf)}</h4>
        <p>📅 ${fmtDate(c.data)}</p>
        <div class="compra-produtos">${prods}</div>
      </div>
      <div class="compra-valor">${fmt(c.valor_total)}</div>
    </div>`;
}

function renderClientes() {
  const tbody = document.getElementById("tbl-clientes");
  const empty = document.getElementById("empty-clientes");
  if (!DB.clientes.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  tbody.innerHTML = DB.clientes
    .map((c) => {
      const pets = DB.pets.filter((p) => p.dono_cpf === c.cpf).length;
      return `<tr>
      <td><span class="badge badge-teal">${c.cpf}</span></td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.telefone}</td>
      <td>${pets > 0 ? `<span class="badge badge-green">🐾 ${pets} pet${pets > 1 ? "s" : ""}</span>` : "—"}</td>
      <td><div class="td-actions">
        <button class="btn btn-danger btn-sm" onclick="deleteCliente('${c.cpf}')">🗑</button>
      </div></td>
    </tr>`;
    })
    .join("");
}

function renderPets() {
  const tbody = document.getElementById("tbl-pets");
  const empty = document.getElementById("empty-pets");
  if (!DB.pets.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  const emojiAnimal = (a) =>
    ({
      Cachorro: "🐶",
      Gato: "🐱",
      Pássaro: "🦜",
      Coelho: "🐰",
      Hamster: "🐹",
    })[a] || "🐾";
  tbody.innerHTML = DB.pets
    .map(
      (p) => `<tr>
    <td><span class="badge badge-teal">#${p.id}</span></td>
    <td>${emojiAnimal(p.animal)} ${p.animal}</td>
    <td><strong>${p.nome}</strong></td>
    <td>${p.raca || "—"}</td>
    <td>${clienteNome(p.dono_cpf)}</td>
    <td><div class="td-actions">
      <button class="btn btn-danger btn-sm" onclick="deletePet(${p.id})">🗑</button>
    </div></td>
  </tr>`,
    )
    .join("");
}

function renderProdutos() {
  const tbody = document.getElementById("tbl-produtos");
  const empty = document.getElementById("empty-produtos");
  if (!DB.produtos.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  tbody.innerHTML = DB.produtos
    .map(
      (p) => `<tr>
    <td><span class="badge badge-teal">#${p.id}</span></td>
    <td><strong>${p.nome}</strong></td>
    <td>${fmt(p.preco)}</td>
    <td>
      <span class="badge ${p.estoque > 5 ? "badge-green" : "badge-orange"}">
        ${p.estoque > 5 ? "✅" : "⚠️"} ${p.estoque} un.
      </span>
    </td>
    <td><div class="td-actions">
      <button class="btn btn-danger btn-sm" onclick="deleteProduto(${p.id})">🗑</button>
    </div></td>
  </tr>`,
    )
    .join("");
}

function renderCompras() {
  const cont = document.getElementById("lista-compras");
  const empty = document.getElementById("empty-compras");
  if (!DB.compras.length) {
    cont.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  cont.innerHTML = [...DB.compras]
    .reverse()
    .map((c) => compraCard(c))
    .join("");
}

// ── Salvar ──
function salvarCliente() {
  const cpf = document.getElementById("cli-cpf").value.trim();
  const nome = document.getElementById("cli-nome").value.trim();
  const tel = document.getElementById("cli-telefone").value.trim();
  if (!cpf || !nome || !tel) {
    toast("Preencha todos os campos!", "error");
    return;
  }
  if (DB.clientes.find((c) => c.cpf === cpf)) {
    toast("CPF já cadastrado!", "error");
    return;
  }
  DB.clientes.push({ cpf, nome, telefone: tel });
  closeModal("modal-cliente");
  renderPage("clientes");
  renderDashboard();
  toast("Cliente cadastrado com sucesso!");
}

function salvarPet() {
  const animal = document.getElementById("pet-animal").value;
  const nome = document.getElementById("pet-nome").value.trim();
  const raca = document.getElementById("pet-raca").value.trim();
  const dono = document.getElementById("pet-dono").value;
  if (!animal || !nome || !dono) {
    toast("Preencha os campos obrigatórios!", "error");
    return;
  }
  DB.pets.push({ id: nextId(DB.pets), animal, nome, raca, dono_cpf: dono });
  closeModal("modal-pet");
  renderPage("pets");
  renderDashboard();
  toast("Pet cadastrado com sucesso!");
}

function salvarProduto() {
  const nome = document.getElementById("prod-nome").value.trim();
  const preco = parseFloat(document.getElementById("prod-preco").value);
  const estoque = parseInt(document.getElementById("prod-estoque").value);
  if (!nome || isNaN(preco) || isNaN(estoque)) {
    toast("Preencha todos os campos!", "error");
    return;
  }
  DB.produtos.push({ id: nextId(DB.produtos), nome, preco, estoque });
  closeModal("modal-produto");
  renderPage("produtos");
  renderDashboard();
  toast("Produto cadastrado com sucesso!");
}

// ── Delete ──
function deleteCliente(cpf) {
  if (!confirm(`Remover cliente ${clienteNome(cpf)}?`)) return;
  DB.clientes = DB.clientes.filter((c) => c.cpf !== cpf);
  renderPage("clientes");
  renderDashboard();
  toast("Cliente removido.");
}
function deletePet(id) {
  if (!confirm("Remover este pet?")) return;
  DB.pets = DB.pets.filter((p) => p.id !== id);
  renderPage("pets");
  renderDashboard();
  toast("Pet removido.");
}
function deleteProduto(id) {
  if (!confirm("Remover este produto?")) return;
  DB.produtos = DB.produtos.filter((p) => p.id !== id);
  renderPage("produtos");
  renderDashboard();
  toast("Produto removido.");
}

// ── Filter ──
function filterTable(tbodyId, q) {
  const q2 = q.toLowerCase();
  document.querySelectorAll(`#${tbodyId} tr`).forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(q2) ? "" : "none";
  });
}
function filterCompras(q) {
  const q2 = q.toLowerCase();
  document.querySelectorAll("#lista-compras .compra-card").forEach((el) => {
    el.style.display = el.textContent.toLowerCase().includes(q2) ? "" : "none";
  });
}

// ── Close modal on overlay click ──
document.querySelectorAll(".modal-overlay").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (e.target === el) closeModal(el.id);
  });
});

// ── Init ──
document.getElementById("topbarDate").textContent =
  new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
document.getElementById("footerYear").textContent = new Date().getFullYear();

// Mask CPF
document.getElementById("cli-cpf").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  this.value = v;
});
// Mask Tel
document.getElementById("cli-telefone").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{5})(\d{4})$/, "$1-$2");
  this.value = v;
});

renderDashboard();
