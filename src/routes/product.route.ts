// import express from 'express'
// import { ProductController } from '../controllers/product.controller'

// const router = express.Router()
// const productController = new ProductController()

// router.get('/', productController.searchProducts)
// router.get('/search', productController.searchProductsNameAndId)
// router.get('/autocomplete', productController.getAutocompleteSuggestions)
// router.get('/category', productController.getAllCategories)
// router.post('/', productController.createProduct)
// router.get('/stock/:id', productController.getProductStockByProductId)
// router.get('/:id', productController.getProductById)
// router.put('/:id', productController.updateProduct)

// router.delete('/:id', productController.deleteProduct)

// export const productRouter = router

import { Router, Request, Response } from "express";
import { ProductController } from "../controllers/product.controller";

const productController = new ProductController()

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tìm kiếm sản phẩm
 *     description: Trả về danh sách sản phẩm dựa trên bộ lọc tìm kiếm.
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345"
 *                   name:
 *                     type: string
 *                     example: "Sản phẩm A"
 */
router.get("/", productController.searchProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Tìm kiếm sản phẩm theo tên và ID
 *     description: Trả về danh sách sản phẩm có tên hoặc ID khớp với truy vấn.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên sản phẩm
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/search", productController.searchProductsNameAndId);

/**
 * @swagger
 * /api/products/autocomplete:
 *   get:
 *     summary: Gợi ý tên sản phẩm tự động
 *     description: Trả về danh sách gợi ý sản phẩm dựa trên từ khóa tìm kiếm.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/autocomplete", productController.getAutocompleteSuggestions);

/**
 * @swagger
 * /api/products/category:
 *   get:
 *     summary: Lấy danh sách danh mục sản phẩm
 *     description: Trả về danh sách tất cả các danh mục sản phẩm hiện có.
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/category", productController.getAllCategories);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     description: Tạo một sản phẩm mới trong hệ thống.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sản phẩm mới"
 *               category:
 *                 type: string
 *                 example: "Điện tử"
 *               price:
 *                 type: number
 *                 example: 100000
 *     responses:
 *       201:
 *         description: Sản phẩm được tạo thành công
 */
router.post("/", productController.createProduct);

/**
 * @swagger
 * /api/products/stock/{id}:
 *   get:
 *     summary: Lấy thông tin tồn kho của sản phẩm
 *     description: Trả về số lượng tồn kho của sản phẩm theo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/stock/:id", productController.getProductStockByProductId);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo ID
 *     description: Trả về chi tiết của một sản phẩm.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật thông tin sản phẩm
 *     description: Cập nhật thông tin của một sản phẩm theo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sản phẩm mới cập nhật"
 *               category:
 *                 type: string
 *                 example: "Điện tử"
 *               price:
 *                 type: number
 *                 example: 120000
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     description: Xóa sản phẩm theo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", productController.deleteProduct);

export const productRouter = router