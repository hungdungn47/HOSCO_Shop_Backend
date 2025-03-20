import { AppDataSource } from "../config/datasource";
import { ProductBatch } from "../entities/ProductBatch";
import { WarehouseStock } from "../entities/WarehouseStock";
import { DiscountUnit, Product } from "../entities/Product";
import { Warehouse } from "../entities/Warehouse";
import { Partner, PartnerRole } from "../entities/Partner";
import { MyTransaction, TransactionType, PaymentMethod } from "../entities/MyTransaction";
import { TransactionItem } from "../entities/TransactionItem";
import { EntityManager, ILike, Repository } from "typeorm";

export class TransactionService {
  static async generateBatchNumber(productId: string, transactionalEntityManager: EntityManager): Promise<string> {
    const today = new Date();
    const datePart = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;

    // Count existing batches for this product today
    const count = await transactionalEntityManager.getRepository(ProductBatch)
      .count({
        where: {
          product: { id: productId },  // Ensure `product` is correctly referenced
          batchNumber: ILike(`${datePart}%`) // Use `Like` for partial matching
        }
      });

    // Increment sequence number
    const sequence = (count + 1).toString().padStart(3, "0"); // 001, 002, etc.

    return `${datePart}-${productId}-${sequence}`;
  }
  static async purchaseProduct(
    productId: string,
    warehouseId: string,
    supplierId: number,
    // batchNumber: string,
    expiryDate: string,
    purchasePrice: number,
    purchaseNote: string,
    batchQuantity: number,
    vat: number = 0,
    discount: number = 0,
    discountUnit: DiscountUnit = DiscountUnit.PERCENTAGE,
    paymentMethod: PaymentMethod = PaymentMethod.BANK_TRANSFER
  ) {
    return await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
      const productRepo = transactionalEntityManager.getRepository(Product);
      const warehouseRepo = transactionalEntityManager.getRepository(Warehouse);
      const supplierRepo = transactionalEntityManager.getRepository(Partner);
      const warehouseStockRepo = transactionalEntityManager.getRepository(WarehouseStock);
      const productBatchRepo = transactionalEntityManager.getRepository(ProductBatch);
      const transactionRepo = transactionalEntityManager.getRepository(MyTransaction);
      const transactionItemRepo = transactionalEntityManager.getRepository(TransactionItem);

      // Check if product, warehouse, and supplier exist
      const product = await productRepo.findOne({ where: { id: productId } });
      if (!product) throw new Error("Product not found.");

      const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });
      if (!warehouse) throw new Error("Warehouse not found.");

      const supplier = await supplierRepo.findOne({ where: { id: supplierId, role: PartnerRole.SUPPLIER } });
      if (!supplier) throw new Error("Supplier not found.");

      let batchNumber = await this.generateBatchNumber(productId, transactionalEntityManager)

      // Calculate total amount before VAT and discount
      const totalAmountBeforeDiscount = batchQuantity * purchasePrice;

      console.log(totalAmountBeforeDiscount)

      console.log('Discount unit:', discountUnit)

      // Apply discount
      let discountAmount = discountUnit === "percentage"
        ? (totalAmountBeforeDiscount * discount) / 100
        : discount;

      // Apply VAT
      const totalAmount = totalAmountBeforeDiscount - discountAmount + (totalAmountBeforeDiscount * vat) / 100;

      // Create a new purchase transaction
      const newTransaction = transactionRepo.create({
        transactionDate: new Date(),
        type: TransactionType.PURCHASE,
        totalAmount,
        vat,
        discount,
        discountUnit,
        partner: supplier,
      });
      await transactionRepo.save(newTransaction);

      // Create transaction item
      const newTransactionItem = transactionItemRepo.create({
        transaction: newTransaction,
        product,
        quantity: batchQuantity,
        unitPrice: purchasePrice,
        subtotal: purchasePrice * batchQuantity
      });
      await transactionItemRepo.save(newTransactionItem);

      // Find or create WarehouseStock
      let warehouseStock = await warehouseStockRepo.findOne({
        where: { product: { id: productId }, warehouse: { id: warehouseId } },
      });

      if (!warehouseStock) {
        warehouseStock = warehouseStockRepo.create({
          product,
          warehouse,
          totalQuantity: 0,
        });
        await warehouseStockRepo.save(warehouseStock);
      }

      // Create a new ProductBatch
      const newBatch = productBatchRepo.create({
        batchNumber,
        expiryDate: new Date(expiryDate),
        purchasePrice,
        purchaseNote,
        batchQuantity,
        product,
        supplier,
        warehouseStock,
      });

      await productBatchRepo.save(newBatch);

      // Update warehouse stock quantity
      warehouseStock.totalQuantity += batchQuantity;
      await warehouseStockRepo.save(warehouseStock);

      return {
        message: "Product purchased successfully!",
        transactionId: newTransaction.id,
        batch: newBatch,
        updatedStock: warehouseStock.totalQuantity,
      };
    });
  }

  static async getAllTransactions(page: number = 1, pageSize: number = 10, transactionType?: TransactionType): Promise<{ transactions: MyTransaction[], total: number }> {
    let transactionRepository: Repository<MyTransaction> = AppDataSource.getRepository(MyTransaction);
    const whereClause = transactionType ? { type: transactionType } : {};
    const [transactions, total] = await transactionRepository.findAndCount({
      where: whereClause,
      relations: ["partner", "items", "items.product"], // Include related entities
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { transactionDate: "DESC" }, // Sort by newest first
    });

    return { transactions, total };
  }

  static async createSaleTransaction(
    customerId: number,
    warehouseId: string,
    paymentMethod: PaymentMethod = PaymentMethod.CASH,
    saleItems: Array<{
      productId: string,
      quantity: number,
      unitPrice: number,
      batchId?: number // Optional: to specify which batch to sell from
    }>,
    discount: number = 0,
    discountUnit: DiscountUnit = DiscountUnit.PERCENTAGE,
    vat: number = 0,
    saleNote?: string
  ) {
    return await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
      const productRepo = transactionalEntityManager.getRepository(Product);
      const warehouseRepo = transactionalEntityManager.getRepository(Warehouse);
      const customerRepo = transactionalEntityManager.getRepository(Partner);
      const warehouseStockRepo = transactionalEntityManager.getRepository(WarehouseStock);
      const productBatchRepo = transactionalEntityManager.getRepository(ProductBatch);
      const transactionRepo = transactionalEntityManager.getRepository(MyTransaction);
      const transactionItemRepo = transactionalEntityManager.getRepository(TransactionItem);

      // Check if warehouse and customer exist
      const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });
      if (!warehouse) throw new Error("Warehouse not found.");

      const customer = await customerRepo.findOne({ where: { id: customerId } });
      if (!customer) throw new Error("Customer not found.");

      // Calculate total amount before discounts and taxes
      let totalAmountBeforeDiscount = 0;
      const transactionItems = [];

      // Process each sale item
      for (const item of saleItems) {
        // Check if product exists
        const product = await productRepo.findOne({ where: { id: item.productId } });
        if (!product) throw new Error(`Product with ID ${item.productId} not found.`);

        // Find warehouse stock
        const warehouseStock = await warehouseStockRepo.findOne({
          where: { product: { id: item.productId }, warehouse: { id: warehouseId } },
        });

        if (!warehouseStock) {
          throw new Error(`Product ${product.name || item.productId} not available in selected warehouse.`);
        }

        if (warehouseStock.totalQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name || item.productId}. Available: ${warehouseStock.totalQuantity}, Requested: ${item.quantity}`);
        }

        // Update warehouse stock
        warehouseStock.totalQuantity -= item.quantity;
        await warehouseStockRepo.save(warehouseStock);

        // Handle product batches (FIFO - First In, First Out)
        let remainingQuantityToSell = item.quantity;

        if (item.batchId) {
          // If specific batch is provided, use it
          const batch = await productBatchRepo.findOne({
            where: { id: item.batchId }
          });

          if (!batch) {
            throw new Error(`Batch with ID ${item.batchId} not found in the selected warehouse.`);
          }

          if (batch.batchQuantity < remainingQuantityToSell) {
            throw new Error(`Insufficient quantity in batch ${batch.batchNumber}. Available: ${batch.batchQuantity}, Requested: ${remainingQuantityToSell}`);
          }

          batch.batchQuantity -= remainingQuantityToSell;
          await productBatchRepo.save(batch);
          remainingQuantityToSell = 0;
        } else {
          // Use FIFO approach - sell from oldest batches first
          const batches = await productBatchRepo.find({
            where: { warehouseStock: { id: warehouseStock.id } },
            order: { expiryDate: "ASC" } // Sell items that expire first
          });

          for (const batch of batches) {
            if (remainingQuantityToSell <= 0) break;

            const quantityToSellFromBatch = Math.min(batch.batchQuantity, remainingQuantityToSell);
            batch.batchQuantity -= quantityToSellFromBatch;
            await productBatchRepo.save(batch);

            remainingQuantityToSell -= quantityToSellFromBatch;
          }

          if (remainingQuantityToSell > 0) {
            throw new Error(`Could not find enough stock in batches for product ${product.name || item.productId}.`);
          }
        }

        // Calculate item subtotal
        const subtotal = item.unitPrice * item.quantity;
        totalAmountBeforeDiscount += subtotal;

        // Create transaction item
        const newTransactionItem = transactionItemRepo.create({
          product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal
        });

        transactionItems.push(newTransactionItem);
      }

      // Apply discount
      let discountAmount = discountUnit === DiscountUnit.PERCENTAGE
        ? (totalAmountBeforeDiscount * discount) / 100
        : discount;

      // Calculate total with VAT
      const totalAmount = totalAmountBeforeDiscount - discountAmount + (totalAmountBeforeDiscount * vat) / 100;

      // const newTransaction = transactionRepo.create({
      //   transactionDate: new Date(),
      //   type: TransactionType.PURCHASE,
      //   totalAmount,
      //   vat,
      //   discount,
      //   discountUnit,
      //   partner: supplier,
      // });
      // await transactionRepo.save(newTransaction);
      // Create transaction
      const newTransaction = transactionRepo.create({
        transactionDate: new Date(),
        type: TransactionType.SALE,
        totalAmount,
        vat,
        discount,
        discountUnit,
        partner: customer,
        // paymentMethod,
        // note: saleNote
      });

      await transactionRepo.save(newTransaction);

      // Save transaction items and link them to the transaction
      for (const item of transactionItems) {
        item.transaction = newTransaction;
        await transactionItemRepo.save(item);
      }

      return {
        message: "Sale transaction created successfully!",
        transactionId: newTransaction.id,
        totalAmount,
        itemCount: saleItems.length
      };
    });
  }

  static async getTransactionById(transactionId: number): Promise<MyTransaction> {
    let transactionRepository: Repository<MyTransaction> = AppDataSource.getRepository(MyTransaction);
    console.log("Transaction ID: ", transactionId);
    const res = await transactionRepository.findOne({
      where: { id: transactionId },
      relations: ["partner", "items", "items.product"],
    })
    return res!;
  }
}
