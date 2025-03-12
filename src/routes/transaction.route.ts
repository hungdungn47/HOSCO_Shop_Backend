import express from 'express'
import { TransactionController } from '../controllers/transaction.controller'

const router = express.Router()

router.post('/purchase', TransactionController.purchaseProduct)
router.get('/', TransactionController.getAllTransactions)

export const transactionRouter = router