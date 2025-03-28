import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { PaymentMethod } from "../entities/MyTransaction";
import { DiscountUnit } from "../entities/Product";

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
      const transactionType = req.query.type;
      const result = await TransactionService.getAllTransactions()
      return res.status(200).json({ message: "Success", result })
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to get transactions", error: error.message })
    }
  }

  static async getTransactionById(req: Request, res: Response): Promise<any> {
    const transactionId = Number(req.params.id);
    const result = await TransactionService.getTransactionById(transactionId);
    return res.status(200).json({
      message: 'success',
      result
    })
  }

  static async createSaleTransaction(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        customerId,
        warehouseId,
        paymentMethod = PaymentMethod.CASH,
        saleItems,
        discount = 0,
        discountUnit = DiscountUnit.PERCENTAGE,
        vat = 0,
        saleNote
      } = req.body;

      // Process the sale
      const result = await TransactionService.createSaleTransaction(
        customerId,
        warehouseId,
        paymentMethod,
        saleItems,
        discount,
        discountUnit,
        vat,
        saleNote
      );

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Failed to create transaction", error: error.message })
    }
  }

}
