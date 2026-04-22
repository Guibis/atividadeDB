import db from "../config/db.js";

export const listarPets = (req, res) => {
    const sql = `
        SELECT p.*, c.Nome as nome_dono
        FROM Pets p
        LEFT JOIN cliente c ON p.fk_Clientes_id_cliente = c.CPF
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro ao buscar pets:", err);
            return res.status(500).json({ error: "Erro ao buscar pets" });
        }
        res.status(200).json({ pets: result });
    });
}

export const cadastrarPet = (req, res) => {
    const { nome, raca, tutor_cpf, animal } = req.body;
    db.query("INSERT INTO Pets (nome, raca, fk_Clientes_id_cliente, animal) VALUES (?, ?, ?, ?)", [nome, raca, tutor_cpf, animal], (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar pet:", err);
            return res.status(500).json({ error: "Erro ao cadastrar pet" });
        }
        res.status(200).json({ message: "Pet cadastrado com sucesso" });
    });
}

export const editarPet = (req, res) => {
    const { id_animal, nome, raca, tutor_cpf, animal } = req.body;
    db.query("UPDATE Pets SET nome = ?, raca = ?, fk_Clientes_id_cliente = ?, animal = ? WHERE id_animal = ?", [nome, raca, tutor_cpf, animal, id_animal], (err, result) => {
        if (err) {
            console.error("Erro ao editar pet:", err);
            return res.status(500).json({ error: "Erro ao editar pet" });
        }
        res.status(200).json({ message: "Pet editado com sucesso" });
    });
}

export const deletarPet = (req, res) => {
    const { id_animal } = req.params;
    db.query("DELETE FROM Pets WHERE id_animal = ?", [id_animal], (err, result) => {
        if (err) {
            console.error("Erro ao deletar pet:", err);
            return res.status(500).json({ error: "Erro ao deletar pet" });
        }
        res.status(200).json({ message: "Pet deletado com sucesso" });
    });
}
