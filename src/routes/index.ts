import express, { Router } from "express"
import { warehouseRouter } from "./warehouse.route"
import { productRouter } from "./product.route"
import { partnerRouter } from "./partner.route"

const router: Router = express.Router()

router.use('/warehouses', warehouseRouter)
router.use('/products', productRouter)
router.use('/partners', partnerRouter)

export default router