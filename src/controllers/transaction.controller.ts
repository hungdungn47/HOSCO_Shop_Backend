import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";

export class TransactionController {
  static async purchaseProduct(req: Request, res: Response): Promise<any> {
    try {
      const {
        productId,
        warehouseId,
        supplierId,
        expiryDate,
        purchasePrice,
        purchaseNote,
        batchQuantity,
        vat,
        discount,
        discountUnit,
        paymentMethod
      } = req.body;

      if (!productId || !warehouseId || !supplierId || !batchQuantity || !expiryDate || !purchasePrice) {
        return res.status(400).json({ message: "Missing required fields: productId, warehouseId, supplierId, expiryDate, purchasePrice, batchQuantity" });
      }

      const result = await TransactionService.purchaseProduct(
        productId,
        warehouseId,
        supplierId,
        expiryDate,
        purchasePrice,
        purchaseNote,
        batchQuantity,
        vat,
        discount,
        discountUnit,
        paymentMethod
      );

      return res.status(201).json(result);
    } catch (error: any) {
      console.error("Transaction failed:", error);
      return res.status(500).json({ message: "Purchase transaction failed.", error: error.message });
    }
  }
  static async getAllTransactions(req: Request, res: Response): Promise<any> {
    try {
      const result = await TransactionService.getAllTransactions()
      return res.status(200).json({ message: "Success", result })
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to get transactions", error: error.message })
    }
  }
}
