const API = "http://localhost:3000";
let editingClienteCPF = null;
let editingPetId = null;
let editingProdutoId = null;
let editingCompraId = null;
let produtosDisponiveis = [];
let lastComprasData = [];

const fmt = (v) => "R$ " + parseFloat(v).toFixed(2).replace(".", ",");
const fmtDate = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString("pt-BR"); };
const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
const delSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="white"><path d="M 11 -0.03125 C 10.164063 -0.03125 9.34375 0.132813 8.75 0.71875 C 8.15625 1.304688 7.96875 2.136719 7.96875 3 L 4 3 C 3.449219 3 3 3.449219 3 4 L 2 4 L 2 6 L 24 6 L 24 4 L 23 4 C 23 3.449219 22.550781 3 22 3 L 18.03125 3 C 18.03125 2.136719 17.84375 1.304688 17.25 0.71875 C 16.65625 0.132813 15.835938 -0.03125 15 -0.03125 Z M 11 2.03125 L 15 2.03125 C 15.546875 2.03125 15.71875 2.160156 15.78125 2.21875 C 15.84375 2.277344 15.96875 2.441406 15.96875 3 L 10.03125 3 C 10.03125 2.441406 10.15625 2.277344 10.21875 2.21875 C 10.28125 2.160156 10.453125 2.03125 11 2.03125 Z M 4 7 L 4 23 C 4 24.652344 5.347656 26 7 26 L 19 26 C 20.652344 26 22 24.652344 22 23 L 22 7 Z M 8 10 L 10 10 L 10 22 L 8 22 Z M 12 10 L 14 10 L 14 22 L 12 22 Z M 16 10 L 18 10 L 18 22 L 16 22 Z"></path></svg>`;

function toast(msg, type = "success") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = (type === "success" ? "✅" : "❌") + " " + msg;
    document.getElementById("toastContainer").appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ── Navigation ──
function navigate(page, el) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    document.getElementById("page-" + page).classList.add("active");
    if (!el) {
        document.querySelectorAll(".nav-item").forEach((item) => {
            if (item.getAttribute("onclick")?.includes(`'${page}'`)) el = item;
        });
    }
    if (el) el.classList.add("active");
    const config = { dashboard:{title:"Dashboard",icon:"📊"}, clientes:{title:"Clientes",icon:"👤"}, pets:{title:"Pets",icon:"🐶"}, produtos:{title:"Produtos",icon:"🛒"}, compras:{title:"Compras",icon:"💳"} };
    const info = config[page] || { title: page, icon: "🐾" };
    document.getElementById("topbarTitle").innerHTML = `${info.icon} <span>${info.title}</span>`;
    renderPage(page);
    closeSidebar();
}

function toggleSidebar() { document.getElementById("sidebar").classList.toggle("open"); document.getElementById("sidebarOverlay").classList.toggle("open"); }
function closeSidebar() { document.getElementById("sidebar").classList.remove("open"); document.getElementById("sidebarOverlay").classList.remove("open"); }

// ── Modal ──
function openModal(id) {
    if (id === "modal-pet") populateDonoSelect();
    document.getElementById(id).classList.add("open");
}
function closeModal(id) {
    document.getElementById(id).classList.remove("open");
    document.getElementById(id).querySelectorAll("input, select, textarea").forEach((el) => { el.value = ""; el.disabled = false; });
    if (id === "modal-cliente") { editingClienteCPF = null; document.getElementById("modal-cliente-title").textContent = "👤 Novo Cliente"; }
    if (id === "modal-pet") { editingPetId = null; document.getElementById("modal-pet-title").textContent = "🐶 Novo Pet"; }
    if (id === "modal-produto") { editingProdutoId = null; document.getElementById("modal-produto-title").textContent = "📦 Novo Produto"; }
    if (id === "modal-compra") { editingCompraId = null; document.getElementById("modal-compra-title").textContent = "💳 Nova Compra"; document.getElementById("compra-produtos-list").innerHTML = ""; document.getElementById("compra-total").textContent = "R$ 0,00"; }
}

async function populateDonoSelect() {
    try {
        const res = await fetch(`${API}/clientes`);
        const data = await res.json();
        const clientes = data.clientes || [];
        const sel = document.getElementById("pet-dono");
        sel.innerHTML = '<option value="">Selecione o dono...</option>';
        clientes.forEach((c) => { sel.innerHTML += `<option value="${c.CPF}">${c.Nome} (${c.CPF})</option>`; });
    } catch (err) { console.error("Erro ao carregar clientes:", err); }
}

// ── Render ──
function renderPage(page) {
    if (page === "dashboard") renderDashboard();
    if (page === "clientes") renderClientes();
    if (page === "pets") renderPets();
    if (page === "produtos") renderProdutos();
    if (page === "compras") renderCompras();
}

async function renderDashboard() {
    try {
        const [r1,r2,r3,r4] = await Promise.all([fetch(`${API}/clientes`),fetch(`${API}/pets`),fetch(`${API}/produtos`),fetch(`${API}/compras`)]);
        const [d1,d2,d3,d4] = await Promise.all([r1.json(),r2.json(),r3.json(),r4.json()]);
        document.getElementById("dash-clientes").textContent = (d1.clientes||[]).length;
        document.getElementById("dash-pets").textContent = (d2.pets||[]).length;
        document.getElementById("dash-produtos").textContent = (d3.produtos||[]).length;
        document.getElementById("dash-compras").textContent = (d4.compras||[]).length;
        const cont = document.getElementById("dash-recent-compras");
        const recent = [...(d4.compras||[])].reverse().slice(0, 5);
        if (!recent.length) { cont.innerHTML = '<div class="empty-state"><div class="icon">💳</div><p>Sem compras ainda</p></div>'; return; }
        cont.innerHTML = recent.map((c) => compraCard(c, false)).join("");
    } catch (err) { console.error("Erro dashboard:", err); }
}

function compraCard(c, showActions = false) {
    const prods = (c.produtos || []).map((p) => `<span class="badge badge-orange">${p.nome_produto} x${p.Quantidade}</span>`).join("");
    const actions = showActions ? `<div class="compra-actions"><button class="btn btn-edit btn-sm" onclick="editCompra(${c.id_compra})">${editSvg}</button><button class="btn btn-danger btn-sm" onclick="deleteCompra(${c.id_compra})">${delSvg}</button></div>` : "";
    return `<div class="compra-card">
      <div class="compra-info">
        <h4>💳 Compra #${c.id_compra} — ${c.nome_cliente}</h4>
        <p>📅 ${fmtDate(c.data_compra)}</p>
        <div class="compra-produtos">${prods}</div>
      </div>
      <div class="compra-right">
        <div class="compra-valor">${fmt(c.valor_total)}</div>
        ${actions}
      </div>
    </div>`;
}

async function renderClientes() {
    const tbody = document.getElementById("tbl-clientes");
    const empty = document.getElementById("empty-clientes");
    try {
        const res = await fetch(`${API}/clientes`);
        const data = await res.json();
        const clientes = data.clientes || [];
        if (!clientes.length) { tbody.innerHTML = ""; empty.style.display = "block"; return; }
        empty.style.display = "none";
        tbody.innerHTML = clientes.map((c) => `<tr>
      <td><span class="badge badge-teal">${c.CPF}</span></td>
      <td><strong>${c.Nome}</strong></td>
      <td>${c.Telefone}</td>
      <td>${c.qtd_pets > 0 ? `<span class="badge badge-green">🐾 ${c.qtd_pets} pet${c.qtd_pets > 1 ? "s" : ""}</span>` : "—"}</td>
      <td><div class="td-actions">
        <button class="btn btn-edit btn-sm" onclick="editCliente('${c.CPF}','${c.Nome.replace(/'/g,"\\'")}','${c.Telefone}')">${editSvg}</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCliente('${c.CPF}')">${delSvg}</button>
      </div></td></tr>`).join("");
    } catch (err) { console.error(err); toast("Erro ao carregar clientes", "error"); }
}

async function renderPets() {
    const tbody = document.getElementById("tbl-pets");
    const empty = document.getElementById("empty-pets");
    try {
        const res = await fetch(`${API}/pets`);
        const data = await res.json();
        const pets = data.pets || [];
        if (!pets.length) { tbody.innerHTML = ""; empty.style.display = "block"; return; }
        empty.style.display = "none";
        tbody.innerHTML = pets.map((p) => `<tr>
    <td><span class="badge badge-teal">#${p.id_animal}</span></td>
    <td>🐾 ${p.animal || "—"}</td>
    <td><strong>${p.Nome}</strong></td>
    <td>${p.Raca || "—"}</td>
    <td>${p.nome_dono || "—"}</td>
    <td><div class="td-actions">
      <button class="btn btn-edit btn-sm" onclick="editPet(${p.id_animal},'${(p.animal||'').replace(/'/g,"\\'")}','${p.Nome.replace(/'/g,"\\'")}','${(p.Raca||'').replace(/'/g,"\\'")}','${p.fk_Clientes_id_cliente}')">${editSvg}</button>
      <button class="btn btn-danger btn-sm" onclick="deletePet(${p.id_animal})">${delSvg}</button>
    </div></td></tr>`).join("");
    } catch (err) { console.error(err); toast("Erro ao carregar pets", "error"); }
}

async function renderProdutos() {
    const tbody = document.getElementById("tbl-produtos");
    const empty = document.getElementById("empty-produtos");
    try {
        const res = await fetch(`${API}/produtos`);
        const data = await res.json();
        const produtos = data.produtos || [];
        if (!produtos.length) { tbody.innerHTML = ""; empty.style.display = "block"; return; }
        empty.style.display = "none";
        tbody.innerHTML = produtos.map((p) => `<tr>
    <td><span class="badge badge-teal">#${p.id_produto}</span></td>
    <td><strong>${p.Nome}</strong></td>
    <td>${fmt(p.preco)}</td>
    <td><span class="badge ${p.qtd_estoque > 5 ? "badge-green" : "badge-orange"}">${p.qtd_estoque > 5 ? "✅" : "⚠️"} ${p.qtd_estoque} un.</span></td>
    <td><div class="td-actions">
      <button class="btn btn-edit btn-sm" onclick="editProduto(${p.id_produto},'${p.Nome.replace(/'/g,"\\'")}',${p.preco},${p.qtd_estoque})">${editSvg}</button>
      <button class="btn btn-danger btn-sm" onclick="deleteProduto(${p.id_produto})">${delSvg}</button>
    </div></td></tr>`).join("");
    } catch (err) { console.error(err); toast("Erro ao carregar produtos", "error"); }
}

async function renderCompras() {
    const cont = document.getElementById("lista-compras");
    const empty = document.getElementById("empty-compras");
    try {
        const res = await fetch(`${API}/compras`);
        const data = await res.json();
        lastComprasData = data.compras || [];
        if (!lastComprasData.length) { cont.innerHTML = ""; empty.style.display = "block"; return; }
        empty.style.display = "none";
        cont.innerHTML = [...lastComprasData].reverse().map((c) => compraCard(c, true)).join("");
    } catch (err) { console.error(err); toast("Erro ao carregar compras", "error"); }
}

// ── Edit functions ──
function editCliente(cpf, nome, telefone) {
    editingClienteCPF = cpf;
    document.getElementById("cli-cpf").value = cpf;
    document.getElementById("cli-cpf").disabled = true;
    document.getElementById("cli-nome").value = nome;
    document.getElementById("cli-telefone").value = telefone;
    document.getElementById("modal-cliente-title").textContent = "👤 Editar Cliente";
    openModal("modal-cliente");
}

function togglePetOutro() {
    const sel = document.getElementById("pet-animal");
    const outro = document.getElementById("pet-animal-outro");
    outro.style.display = sel.value === "Outro" ? "block" : "none";
    if (sel.value !== "Outro") outro.value = "";
}

async function editPet(id, animal, nome, raca, dono) {
    editingPetId = id;
    await populateDonoSelect();
    const sel = document.getElementById("pet-animal");
    const knownAnimals = ["Cachorro", "Gato", "Pássaro", "Coelho", "Hamster"];
    if (knownAnimals.includes(animal)) {
        sel.value = animal;
        document.getElementById("pet-animal-outro").style.display = "none";
    } else {
        sel.value = "Outro";
        document.getElementById("pet-animal-outro").style.display = "block";
        document.getElementById("pet-animal-outro").value = animal || "";
    }
    document.getElementById("pet-nome").value = nome;
    document.getElementById("pet-raca").value = raca;
    document.getElementById("pet-dono").value = dono;
    document.getElementById("modal-pet-title").textContent = "🐶 Editar Pet";
    document.getElementById("modal-pet").classList.add("open");
}

function editProduto(id, nome, preco, estoque) {
    editingProdutoId = id;
    document.getElementById("prod-nome").value = nome;
    document.getElementById("prod-preco").value = preco;
    document.getElementById("prod-estoque").value = estoque;
    document.getElementById("modal-produto-title").textContent = "📦 Editar Produto";
    openModal("modal-produto");
}

async function editCompra(id) {
    const compra = lastComprasData.find(c => c.id_compra === id);
    if (!compra) { toast("Compra não encontrada", "error"); return; }
    editingCompraId = id;
    await abrirModalCompra();
    document.getElementById("compra-cliente").value = compra.fk_Clientes_id_cliente;
    const dataStr = compra.data_compra ? new Date(compra.data_compra).toISOString().split("T")[0] : "";
    document.getElementById("compra-data").value = dataStr;
    document.getElementById("compra-produtos-list").innerHTML = "";
    (compra.produtos || []).forEach(p => {
        addProdutoRow();
        const rows = document.querySelectorAll(".produto-row");
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector(".prod-select").value = p.id_produto;
        lastRow.querySelector(".prod-qtd").value = p.Quantidade;
        lastRow.querySelector(".prod-valor").value = p.valor_unitario;
    });
    updateCompraTotal();
    document.getElementById("modal-compra-title").textContent = "💳 Editar Compra";
}

// ── Save functions ──
async function salvarCliente() {
    const cpf = document.getElementById("cli-cpf").value.trim();
    const nome = document.getElementById("cli-nome").value.trim();
    const telefone = document.getElementById("cli-telefone").value.trim();
    if (!cpf || !nome || !telefone) { toast("Preencha todos os campos!", "error"); return; }
    try {
        const isEdit = !!editingClienteCPF;
        const res = await fetch(`${API}/clientes`, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf: isEdit ? editingClienteCPF : cpf, nome, telefone }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Erro", "error"); return; }
        closeModal("modal-cliente"); renderPage("clientes"); renderDashboard();
        toast(isEdit ? "Cliente editado!" : "Cliente cadastrado!");
    } catch (err) { console.error(err); toast("Erro ao salvar cliente", "error"); }
}

async function salvarPet() {
    let animal = document.getElementById("pet-animal").value;
    if (animal === "Outro") {
        animal = document.getElementById("pet-animal-outro").value.trim();
        if (!animal) { toast("Informe o tipo de animal!", "error"); return; }
    }
    const nome = document.getElementById("pet-nome").value.trim();
    const raca = document.getElementById("pet-raca").value.trim();
    const tutor_cpf = document.getElementById("pet-dono").value;
    if (!nome || !tutor_cpf) { toast("Preencha os campos obrigatórios!", "error"); return; }
    try {
        const isEdit = !!editingPetId;
        const body = isEdit ? { id_animal: editingPetId, nome, raca, tutor_cpf, animal } : { nome, raca, tutor_cpf, animal };
        const res = await fetch(`${API}/pets`, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Erro", "error"); return; }
        closeModal("modal-pet"); renderPage("pets"); renderDashboard();
        toast(isEdit ? "Pet editado!" : "Pet cadastrado!");
    } catch (err) { console.error(err); toast("Erro ao salvar pet", "error"); }
}

async function salvarProduto() {
    const nome = document.getElementById("prod-nome").value.trim();
    const preco = parseFloat(document.getElementById("prod-preco").value);
    const qtd_estoque = parseInt(document.getElementById("prod-estoque").value);
    if (!nome || isNaN(preco) || isNaN(qtd_estoque)) { toast("Preencha todos os campos!", "error"); return; }
    try {
        const isEdit = !!editingProdutoId;
        const body = isEdit ? { id_produto: editingProdutoId, nome, preco, qtd_estoque } : { nome, preco, qtd_estoque };
        const res = await fetch(`${API}/produtos`, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Erro", "error"); return; }
        closeModal("modal-produto"); renderPage("produtos"); renderDashboard();
        toast(isEdit ? "Produto editado!" : "Produto cadastrado!");
    } catch (err) { console.error(err); toast("Erro ao salvar produto", "error"); }
}

async function salvarCompra() {
    const fk_Clientes_id_cliente = document.getElementById("compra-cliente").value;
    const data_compra = document.getElementById("compra-data").value;
    if (!fk_Clientes_id_cliente || !data_compra) { toast("Preencha cliente e data!", "error"); return; }
    const produtos = [];
    let valid = true;
    document.querySelectorAll(".produto-row").forEach(row => {
        const sel = row.querySelector(".prod-select");
        const qtd = parseInt(row.querySelector(".prod-qtd").value);
        const val = parseFloat(row.querySelector(".prod-valor").value);
        if (!sel.value || isNaN(qtd) || isNaN(val)) { valid = false; return; }
        produtos.push({ id_produto: parseInt(sel.value), nome_produto: sel.selectedOptions[0].text, quantidade: qtd, valor_unitario: val });
    });
    if (!valid || !produtos.length) { toast("Adicione pelo menos um produto válido!", "error"); return; }
    const valor_total = produtos.reduce((s, p) => s + p.quantidade * p.valor_unitario, 0);
    try {
        const isEdit = !!editingCompraId;
        const url = isEdit ? `${API}/compras/${editingCompraId}` : `${API}/compras`;
        const res = await fetch(url, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data_compra, valor_total, fk_Clientes_id_cliente, produtos }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Erro", "error"); return; }
        closeModal("modal-compra"); renderPage("compras"); renderDashboard();
        toast(isEdit ? "Compra editada!" : "Compra cadastrada!");
    } catch (err) { console.error(err); toast("Erro ao salvar compra", "error"); }
}

// ── Delete functions ──
async function deleteCliente(cpf) {
    if (!confirm("Remover este cliente?")) return;
    try { const r = await fetch(`${API}/clientes/${cpf}`, {method:"DELETE"}); if (!r.ok) { toast("Erro ao deletar","error"); return; } renderPage("clientes"); renderDashboard(); toast("Cliente removido."); } catch(e) { toast("Erro","error"); }
}
async function deletePet(id) {
    if (!confirm("Remover este pet?")) return;
    try { const r = await fetch(`${API}/pets/${id}`, {method:"DELETE"}); if (!r.ok) { toast("Erro ao deletar","error"); return; } renderPage("pets"); renderDashboard(); toast("Pet removido."); } catch(e) { toast("Erro","error"); }
}
async function deleteProduto(id) {
    if (!confirm("Remover este produto?")) return;
    try { const r = await fetch(`${API}/produtos/${id}`, {method:"DELETE"}); if (!r.ok) { toast("Erro ao deletar","error"); return; } renderPage("produtos"); renderDashboard(); toast("Produto removido."); } catch(e) { toast("Erro","error"); }
}
async function deleteCompra(id) {
    if (!confirm("Remover esta compra?")) return;
    try { const r = await fetch(`${API}/compras/${id}`, {method:"DELETE"}); if (!r.ok) { toast("Erro ao deletar","error"); return; } renderPage("compras"); renderDashboard(); toast("Compra removida."); } catch(e) { toast("Erro","error"); }
}

// ── Compra Modal helpers ──
async function abrirModalCompra() {
    try {
        const [r1, r2] = await Promise.all([fetch(`${API}/clientes`), fetch(`${API}/produtos`)]);
        const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
        const clientes = d1.clientes || [];
        produtosDisponiveis = d2.produtos || [];
        const sel = document.getElementById("compra-cliente");
        sel.innerHTML = '<option value="">Selecione o cliente...</option>';
        clientes.forEach(c => { sel.innerHTML += `<option value="${c.CPF}">${c.Nome} (${c.CPF})</option>`; });
        if (!editingCompraId) {
            document.getElementById("compra-produtos-list").innerHTML = "";
            addProdutoRow();
            document.getElementById("compra-data").value = new Date().toISOString().split("T")[0];
        }
        openModal("modal-compra");
    } catch (err) { console.error(err); toast("Erro ao abrir modal", "error"); }
}

function addProdutoRow() {
    const container = document.getElementById("compra-produtos-list");
    const row = document.createElement("div");
    row.className = "produto-row";
    const options = produtosDisponiveis.map(p => `<option value="${p.id_produto}" data-preco="${p.preco}" data-estoque="${p.qtd_estoque}">${p.Nome}</option>`).join("");
    row.innerHTML = `
        <select class="prod-select" onchange="onProdutoSelect(this)"><option value="">Produto...</option>${options}</select>
        <input type="number" class="prod-qtd" placeholder="Qtd" min="1" value="1" oninput="validarQtdEstoque(this);updateCompraTotal()">
        <input type="number" class="prod-valor" placeholder="Valor" step="0.01" min="0" oninput="updateCompraTotal()">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.produto-row').remove();updateCompraTotal()">✕</button>`;
    container.appendChild(row);
}

function onProdutoSelect(sel) {
    const opt = sel.selectedOptions[0];
    const row = sel.closest(".produto-row");
    const qtdInput = row.querySelector(".prod-qtd");
    if (opt.value) {
        row.querySelector(".prod-valor").value = opt.dataset.preco || "";
        qtdInput.max = opt.dataset.estoque || "";
        if (parseInt(qtdInput.value) > parseInt(opt.dataset.estoque)) qtdInput.value = opt.dataset.estoque;
    } else {
        row.querySelector(".prod-valor").value = "";
        qtdInput.removeAttribute("max");
    }
    updateCompraTotal();
}

function validarQtdEstoque(input) {
    const row = input.closest(".produto-row");
    const sel = row.querySelector(".prod-select");
    const opt = sel.selectedOptions[0];
    if (opt && opt.value && opt.dataset.estoque) {
        const max = parseInt(opt.dataset.estoque);
        if (parseInt(input.value) > max) {
            input.value = max;
            toast(`Estoque máximo: ${max} unidades`, "error");
        }
    }
}

function updateCompraTotal() {
    let total = 0;
    document.querySelectorAll(".produto-row").forEach(row => {
        const q = parseFloat(row.querySelector(".prod-qtd").value) || 0;
        const v = parseFloat(row.querySelector(".prod-valor").value) || 0;
        total += q * v;
    });
    document.getElementById("compra-total").textContent = fmt(total);
}

// ── Filter ──
function filterTable(tbodyId, q) { const q2 = q.toLowerCase(); document.querySelectorAll(`#${tbodyId} tr`).forEach((tr) => { tr.style.display = tr.textContent.toLowerCase().includes(q2) ? "" : "none"; }); }
function filterCompras(q) { const q2 = q.toLowerCase(); document.querySelectorAll("#lista-compras .compra-card").forEach((el) => { el.style.display = el.textContent.toLowerCase().includes(q2) ? "" : "none"; }); }

// ── Close modal on overlay click ──
document.querySelectorAll(".modal-overlay").forEach((el) => { el.addEventListener("click", (e) => { if (e.target === el) closeModal(el.id); }); });

// ── Init ──
document.getElementById("topbarDate").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
document.getElementById("footerYear").textContent = new Date().getFullYear();

document.getElementById("cli-cpf").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, ""); v = v.replace(/(\d{3})(\d)/, "$1.$2"); v = v.replace(/(\d{3})(\d)/, "$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); this.value = v;
});
document.getElementById("cli-telefone").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, ""); v = v.replace(/^(\d{2})(\d)/, "($1) $2"); v = v.replace(/(\d{5})(\d{4})$/, "$1-$2"); this.value = v;
});

renderDashboard();
