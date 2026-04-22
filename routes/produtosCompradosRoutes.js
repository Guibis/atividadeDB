import express from "express";
import { 
    listarCompras, 
    cadastrarCompra, 
    editarCompra, 
    deletarCompra 
} from "../controllers/produtosCompradosController.js";

const router = express.Router();

router.get("/", listarCompras);
router.post("/", cadastrarCompra);
router.put("/:id_compra", editarCompra);
router.delete("/:id_compra", deletarCompra);

export default router;
