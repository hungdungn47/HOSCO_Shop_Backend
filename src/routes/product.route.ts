import express from 'express'
import { ProductController } from '../controllers/product.controller'

const router = express.Router()
const productController = new ProductController()

router.get('/', productController.searchProducts)
router.get('/search', productController.searchProductsNameAndId)
router.get('/autocomplete', productController.getAutocompleteSuggestions)
router.get('/category', productController.getAllCategories)
router.post('/', productController.createProduct)
router.get('/stock/:id', productController.getProductStockByProductId)
router.get('/:id', productController.getProductById)
router.put('/:id', productController.updateProduct)

router.delete('/:id', productController.deleteProduct)

export const productRouter = router