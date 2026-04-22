import db from "../config/db.js";

export const listarProdutos = (req, res) => {
    db.query("SELECT * FROM Produtos", (err, result) => {
        if (err) {
            console.error("Erro ao buscar produtos:", err);
            return res.status(500).json({ error: "Erro ao buscar produtos" });
        }
        res.status(200).json({ produtos: result });
    });
}

export const cadastrarProduto = (req, res) => {
    const { nome, preco, qtd_estoque } = req.body;
    db.query("INSERT INTO Produtos (nome, preco, qtd_estoque) VALUES (?, ?, ?)", [nome, preco, qtd_estoque], (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar produto:", err);
            return res.status(500).json({ error: "Erro ao cadastrar produto" });
        }
        res.status(200).json({ message: "Produto cadastrado com sucesso" });
    });
}

export const editarProduto = (req, res) => {
    const { id_produto, nome, preco, qtd_estoque } = req.body;
    db.query("UPDATE Produtos SET nome = ?, preco = ?, qtd_estoque = ? WHERE id_produto = ?", [nome, preco, qtd_estoque, id_produto], (err, result) => {
        if (err) {
            console.error("Erro ao editar produto:", err);
            return res.status(500).json({ error: "Erro ao editar produto" });
        }
        res.status(200).json({ message: "Produto editado com sucesso" });
    });
}

export const deletarProduto = (req, res) => {
    const { id_produto } = req.params;
    db.query("DELETE FROM Produtos WHERE id_produto = ?", [id_produto], (err, result) => {
        if (err) {
            console.error("Erro ao deletar produto:", err);
            return res.status(500).json({ error: "Erro ao deletar produto" });
        }
        res.status(200).json({ message: "Produto deletado com sucesso" });
    });
}
