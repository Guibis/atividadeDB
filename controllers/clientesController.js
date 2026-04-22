import db from "../config/db.js";

export const listarClientes = (req, res) => {
    db.query("SELECT * FROM cliente", (err, result) => {
        if (err) {
            console.error("Erro ao buscar clientes:", err);
            return res.status(500).json({ error: "Erro ao buscar clientes" });
        }
        res.status(200).json({ clientes: result });
    });
}

export const cadastrarCliente = (req, res) => {
    const { cpf, nome, telefone } = req.body;
    db.query("INSERT INTO cliente (CPF, Nome, Telefone) VALUES (?, ?, ?)", [cpf, nome, telefone], (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar cliente:", err);
            return res.status(500).json({ error: "Erro ao cadastrar cliente" });
        }
        res.status(200).json({ message: "Cliente cadastrado com sucesso" });
    });
}

export const deletarCliente = (req, res) => {
    const { cpf } = req.params;
    db.query("DELETE FROM cliente WHERE CPF = ?", [cpf], (err, result) => {
        if (err) {
            console.error("Erro ao deletar cliente:", err);
            return res.status(500).json({ error: "Erro ao deletar cliente" });
        }
        res.status(200).json({ message: "Cliente deletado com sucesso" });
    });
}
