import express from 'express'
import { TransactionController } from '../controllers/transaction.controller'
import { validateCreateSaleTransaction } from '../middlewares/validation'

const router = express.Router()

router.post('/purchase', TransactionController.purchaseProduct)
router.post('/sale', validateCreateSaleTransaction, TransactionController.createSaleTransaction)
router.get('/', TransactionController.getAllTransactions)

export const transactionRouter = router