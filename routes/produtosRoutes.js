import express from "express";
import { listarProdutos, cadastrarProduto, deletarProduto, editarProduto } from "../controllers/produtosController.js";

const router = express.Router();

router.get("/", listarProdutos);
router.post("/", cadastrarProduto);
router.put("/", editarProduto);
router.delete("/:id_produto", deletarProduto);

export default router;