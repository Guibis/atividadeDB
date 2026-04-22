import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import clientesRoutes from "./routes/clientesRoutes.js";
import petsRoutes from "./routes/petsRoutes.js";
import produtosRoutes from "./routes/produtosRoutes.js";
import produtosCompradosRoutes from "./routes/produtosCompradosRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use("/clientes", clientesRoutes);
app.use("/pets", petsRoutes);
app.use("/produtos", produtosRoutes);
app.use("/compras", produtosCompradosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});