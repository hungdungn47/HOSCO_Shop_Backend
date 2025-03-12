import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
  // Create a new product
  async createProduct(req: Request, res: Response): Promise<any> {
    try {
      const product = await productService.createProduct(req.body);
      return res.status(201).json({ message: "Created product successfully!", product });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create product", error: (error as Error).message });
    }
  }

  // Get all products with pagination
  async getProducts(req: Request, res: Response): Promise<any> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const products = await productService.getProducts(page, pageSize);
      return res.status(200).json({ message: "Fetched products successfully!", page, pageSize, ...products });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch products", error: (error as Error).message });
    }
  }

  // Get a single product by ID
  async getProductById(req: Request, res: Response): Promise<any> {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json({ message: "Fetched product successfully!", product });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch product", error: (error as Error).message });
    }
  }

  // Search products by name or ID with pagination
  async searchProducts(req: Request, res: Response): Promise<any> {
    try {
      const query = req.query.q as string;
      const category = req.query.category as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const products = await productService.searchProducts(query, category, page, pageSize);
      return res.status(200).json({ message: "Search completed successfully!", products });
    } catch (error) {
      return res.status(500).json({ message: "Failed to search products", error: (error as Error).message });
    }
  }

  // Update a product
  async updateProduct(req: Request, res: Response): Promise<any> {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update product", error: (error as Error).message });
    }
  }

  // Delete a product
  async deleteProduct(req: Request, res: Response): Promise<any> {
    try {
      const success = await productService.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete product", error: (error as Error).message });
    }
  }
}
