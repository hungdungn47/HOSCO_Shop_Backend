import express from "express";
import { WarehouseController } from "../controllers/warehouse.controller";

const router = express.Router();

router.get("/", WarehouseController.getAll);
router.get("/:id", WarehouseController.getById);
router.post("/", WarehouseController.create);
router.put("/:id", WarehouseController.update);
router.delete("/:id", WarehouseController.delete);

export default router;
