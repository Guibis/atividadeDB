import db from "../config/db.js";

export const listarCompras = (req, res) => {
    const sql = `
        SELECT 
            c.id_compra, 
            c.fk_Clientes_id_cliente,
            cl.Nome as nome_cliente, 
            c.data_compra, 
            c.valor_total,
            pc.fk_Produtos_id_produto as id_produto,
            pc.Nome as nome_produto,
            pc.Quantidade,
            pc.Valor as valor_unitario
        FROM Compra c
        JOIN Cliente cl ON c.fk_Clientes_id_cliente = cl.CPF
        LEFT JOIN Produtos_Comprados pc ON c.id_compra = pc.fk_Compras_id_compra
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar compras:", err);
            return res.status(500).json({ error: "Erro ao buscar compras" });
        }

        // Agrupar produtos por compra
        const comprasMap = results.reduce((acc, row) => {
            const { id_compra, fk_Clientes_id_cliente, nome_cliente, data_compra, valor_total, ...produto } = row;
            
            if (!acc[id_compra]) {
                acc[id_compra] = {
                    id_compra,
                    fk_Clientes_id_cliente,
                    nome_cliente,
                    data_compra,
                    valor_total,
                    produtos: []
                };
            }
            
            if (produto.id_produto) {
                acc[id_compra].produtos.push(produto);
            }
            
            return acc;
        }, {});

        res.status(200).json({ compras: Object.values(comprasMap) });
    });
};

export const cadastrarCompra = (req, res) => {
    const { data_compra, valor_total, fk_Clientes_id_cliente, produtos } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            console.error("Erro ao iniciar transação:", err);
            return res.status(500).json({ error: "Erro ao processar compra" });
        }

        // 1. Verificar estoque de todos os produtos
        const ids = produtos.map(p => p.id_produto);
        db.query("SELECT id_produto, Nome, qtd_estoque FROM Produtos WHERE id_produto IN (?)", [ids], (err, rows) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erro ao verificar estoque:", err);
                    res.status(500).json({ error: "Erro ao verificar estoque" });
                });
            }

            // Checar se algum produto excede o estoque
            for (const p of produtos) {
                const dbProd = rows.find(r => r.id_produto === p.id_produto);
                if (!dbProd) {
                    return db.rollback(() => {
                        res.status(400).json({ error: `Produto ID ${p.id_produto} não encontrado` });
                    });
                }
                if (p.quantidade > dbProd.qtd_estoque) {
                    return db.rollback(() => {
                        res.status(400).json({ error: `Estoque insuficiente para "${dbProd.Nome}". Disponível: ${dbProd.qtd_estoque}` });
                    });
                }
            }

            // 2. Inserir a compra
            const sqlCompra = "INSERT INTO Compra (data_compra, valor_total, fk_Clientes_id_cliente) VALUES (?, ?, ?)";
            db.query(sqlCompra, [data_compra, valor_total, fk_Clientes_id_cliente], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erro ao inserir compra:", err);
                        res.status(500).json({ error: "Erro ao cadastrar compra" });
                    });
                }

                const id_compra = result.insertId;

                // 3. Inserir produtos comprados
                const sqlProdutos = "INSERT INTO Produtos_Comprados (fk_Compras_id_compra, fk_Produtos_id_produto, Nome, Quantidade, Valor) VALUES ?";
                const values = produtos.map(p => [id_compra, p.id_produto, p.nome_produto, p.quantidade, p.valor_unitario]);

                db.query(sqlProdutos, [values], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Erro ao inserir produtos comprados:", err);
                            res.status(500).json({ error: "Erro ao cadastrar produtos da compra" });
                        });
                    }

                    // 4. Atualizar estoque
                    let updatesDone = 0;
                    let updateError = false;
                    for (const p of produtos) {
                        db.query("UPDATE Produtos SET qtd_estoque = qtd_estoque - ? WHERE id_produto = ?", [p.quantidade, p.id_produto], (err) => {
                            if (err && !updateError) {
                                updateError = true;
                                return db.rollback(() => {
                                    console.error("Erro ao atualizar estoque:", err);
                                    res.status(500).json({ error: "Erro ao atualizar estoque" });
                                });
                            }
                            updatesDone++;
                            if (updatesDone === produtos.length && !updateError) {
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error("Erro ao commitar transação:", err);
                                            res.status(500).json({ error: "Erro ao finalizar compra" });
                                        });
                                    }
                                    res.status(200).json({ message: "Compra cadastrada com sucesso", id_compra });
                                });
                            }
                        });
                    }
                });
            });
        });
    });
};

export const editarCompra = (req, res) => {
    const { id_compra } = req.params;
    const { data_compra, valor_total, fk_Clientes_id_cliente, produtos } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            console.error("Erro ao iniciar transação:", err);
            return res.status(500).json({ error: "Erro ao processar edição" });
        }

        const sqlUpdateCompra = "UPDATE Compra SET data_compra = ?, valor_total = ?, fk_Clientes_id_cliente = ? WHERE id_compra = ?";
        db.query(sqlUpdateCompra, [data_compra, valor_total, fk_Clientes_id_cliente, id_compra], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erro ao atualizar compra:", err);
                    res.status(500).json({ error: "Erro ao editar compra" });
                });
            }

            db.query("DELETE FROM Produtos_Comprados WHERE fk_Compras_id_compra = ?", [id_compra], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erro ao limpar produtos antigos:", err);
                        res.status(500).json({ error: "Erro ao editar produtos da compra" });
                    });
                }

                const sqlProdutos = "INSERT INTO Produtos_Comprados (fk_Compras_id_compra, fk_Produtos_id_produto, Nome, Quantidade, Valor) VALUES ?";
                const values = produtos.map(p => [id_compra, p.id_produto, p.nome_produto, p.quantidade, p.valor_unitario]);

                db.query(sqlProdutos, [values], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Erro ao inserir novos produtos:", err);
                            res.status(500).json({ error: "Erro ao atualizar produtos da compra" });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Erro ao commitar transação:", err);
                                res.status(500).json({ error: "Erro ao finalizar edição" });
                            });
                        }
                        res.status(200).json({ message: "Compra editada com sucesso" });
                    });
                });
            });
        });
    });
};

export const deletarCompra = (req, res) => {
    const { id_compra } = req.params;

    db.beginTransaction((err) => {
        if (err) {
            console.error("Erro ao iniciar transação:", err);
            return res.status(500).json({ error: "Erro ao processar exclusão" });
        }

        db.query("DELETE FROM Produtos_Comprados WHERE fk_Compras_id_compra = ?", [id_compra], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Erro ao deletar produtos da compra:", err);
                    res.status(500).json({ error: "Erro ao deletar produtos da compra" });
                });
            }

            db.query("DELETE FROM Compra WHERE id_compra = ?", [id_compra], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Erro ao deletar compra:", err);
                        res.status(500).json({ error: "Erro ao deletar compra" });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Erro ao commitar transação:", err);
                            res.status(500).json({ error: "Erro ao finalizar exclusão" });
                        });
                    }
                    res.status(200).json({ message: "Compra deletada com sucesso" });
                });
            });
        });
    });
};
