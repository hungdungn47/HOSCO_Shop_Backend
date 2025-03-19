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

      // Validate request body
      // await validateRequest([
      //   body('customerId').isInt().withMessage('Customer ID must be an integer'),
      //   body('warehouseId').isString().withMessage('Warehouse ID is required'),
      //   body('saleItems').isArray({ min: 1 }).withMessage('At least one sale item is required'),
      //   body('saleItems.*.productId').isString().withMessage('Product ID must be a string'),
      //   body('saleItems.*.quantity').isNumeric().withMessage('Quantity must be a number'),
      //   body('saleItems.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
      //   body('discount').optional().isNumeric().withMessage('Discount must be a number'),
      //   body('vat').optional().isNumeric().withMessage('VAT must be a number')
      // ])(req, res, next);

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
      return res.status(500).json({ message: "Failed to create transaction", error: error.message })
    }
  }

}
