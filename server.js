import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import clientesRoutes from "./routes/clientesRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/clientes", clientesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});