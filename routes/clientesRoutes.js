import express from "express";
import { listarClientes, cadastrarCliente, deletarCliente } from "../controllers/clientesController.js";

const router = express.Router();

router.get("/", listarClientes);
router.post("/", cadastrarCliente);
router.delete("/:cpf", deletarCliente);

export default router;
