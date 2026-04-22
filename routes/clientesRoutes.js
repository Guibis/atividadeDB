import express from "express";
import { listarClientes, cadastrarCliente, deletarCliente, editarCliente } from "../controllers/clientesController.js";

const router = express.Router();

router.get("/", listarClientes);
router.post("/", cadastrarCliente);
router.put("/", editarCliente);
router.delete("/:cpf", deletarCliente);

export default router;
