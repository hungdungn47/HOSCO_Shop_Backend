import express, { Router } from "express"
import { warehouseRouter } from "./warehouse.route"
import { productRouter } from "./product.route"

const router: Router = express.Router()

router.use('/warehouses', warehouseRouter)
router.use('/products', productRouter)

export default router