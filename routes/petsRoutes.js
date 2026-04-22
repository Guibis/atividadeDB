import express from "express";
import { listarPets, cadastrarPet, deletarPet, editarPet } from "../controllers/petsController.js";

const router = express.Router();

router.get("/", listarPets);
router.post("/", cadastrarPet);
router.put("/", editarPet);
router.delete("/:id_animal", deletarPet);

export default router;
