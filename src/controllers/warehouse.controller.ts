import { Request, Response, NextFunction } from "express";
import { WarehouseService } from "../services/warehouse.service";

const warehouseService = new WarehouseService();

export class WarehouseController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    const warehouses = await warehouseService.getAllWarehouses();
    res.status(200).json({
      message: "Get all warehouses successfully",
      total: warehouses.length,
      warehouses
    });
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const warehouse = await warehouseService.getWarehouseProductStock(id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    res.status(200).json({
      message: "Get warehouse successfully",
      warehouse
    });
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id, name, location } = req.body;
    try {
      const warehouse = await warehouseService.createWarehouse(id, name, location);
      res.status(201).json({
        message: "Created warehouse successfully",
        warehouse
      });
    } catch (error) {
      res.status(400).json({ message: "Error creating warehouse", error });
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const { name, location } = req.body;

    const updatedWarehouse = await warehouseService.updateWarehouse(id, name, location);
    if (!updatedWarehouse) return res.status(404).json({ message: "Warehouse not found" });

    res.status(200).json({
      message: "Updated warehouse successfully",
      updatedWarehouse
    });
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;

    const deleted = await warehouseService.deleteWarehouse(id);
    if (!deleted) return res.status(404).json({ message: "Warehouse not found" });

    res.json({ message: "Warehouse deleted successfully" });
  }

  static async getAllWarehouseStock(req: Request, res: Response): Promise<any> {
    const result = await warehouseService.getAllWarehouseStock();
    res.json({ message: "Get all warehouse stock", result });
  }
}
