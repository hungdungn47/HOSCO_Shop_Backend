import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import axios from "axios"
import he from 'he'
import iconv from "iconv-lite"

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

  async getProductStockByProductId(req: Request, res: Response): Promise<any> {
    try {
      const productStock = await productService.getProductStockByProductId(req.params.id);
      return res.status(200).json({ message: "Get product stock successfully!", productStock });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get product stock", error: (error as Error).message });
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
  // async searchProducts(req: Request, res: Response): Promise<any> {
  //   try {
  //     const query = req.query.q as string;
  //     const category = req.query.category as string;
  //     const page = parseInt(req.query.page as string) || 1;
  //     const pageSize = parseInt(req.query.pageSize as string) || 10;

  //     const products = await productService.searchProducts(query, category, page, pageSize);
  //     return res.status(200).json({ message: "Search completed successfully!", ...products });
  //   } catch (error) {
  //     return res.status(500).json({ message: "Failed to search products", error: (error as Error).message });
  //   }
  // }

  async searchProducts(req: Request, res: Response): Promise<any> {
    try {
      const query = req.query.q as string;
      const categoryParam = req.query.category as string;
      const categories = categoryParam ? categoryParam.split(",") : [];
      console.log(categories);
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const products = await productService.searchProducts(query, categories, page, pageSize);

      return res.status(200).json({ message: "Search completed successfully!", ...products });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Failed to search products", error: (error as Error).message });
    }
  }

  async searchProductsNameAndId(req: Request, res: Response): Promise<any> {
    try {
      const query = req.query.q as string;
      const category = req.query.category as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 5;

      const products = await productService.searchProductsNameAndId(query, category, page, pageSize);
      return res.status(200).json({ message: "Search completed successfully!", products });
    } catch (error) {
      return res.status(500).json({ message: "Failed to search products", error: (error as Error).message })
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

  async getAllCategories(req: Request, res: Response): Promise<any> {
    try {
      const result = await productService.getAllCategories();
      return res.status(200).json({ message: "Get all categories successfully!", categories: result });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get categories", error: (error as Error).message });
    }
  }

  async autocompleteSearchGoogle(req: Request, res: Response): Promise<any> {
    try {
      const searchQuery = req.query.q;

      if (searchQuery === "") return res.status(200).json({
        result: []
      })

      // Make request with `responseType: 'arraybuffer'` to prevent automatic encoding
      const response = await axios.get(
        `https://www.google.com/complete/search?client=hp&hl=vn&sugexp=msedr&gs_rn=62&gs_ri=hp&cp=1&gs_id=9c&q=${searchQuery}&xhr=t`,
        { responseType: "arraybuffer" }
      );

      // Convert the response buffer to UTF-8
      const decodedResponse = iconv.decode(response.data, "latin1");

      // Parse JSON from decoded response
      const jsonResponse = JSON.parse(decodedResponse);

      const result = jsonResponse[1].map((rawResult: string[]) => {
        let match = rawResult[0].match(/<b>(.+)<\/b>/);
        if (match) return searchQuery + he.decode(match[1]); // Decode HTML entities properly
      });
      result.unshift(searchQuery)

      res.status(200).json({
        message: "Get autocomplete",
        result: result.filter((searchResult: string | null) => searchResult != null).slice(0, 5)
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get search suggestions", error: (error as Error).message });
    }
  }

  async getAutocompleteSuggestions(req: Request, res: Response): Promise<any> {
    try {
      const searchQuery = req.query.q as string;

      const result = await productService.getAutocompleteSuggestions(searchQuery)
      res.status(200).json({
        message: "Get autocomplete",
        result
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get search suggestions", error: (error as Error).message });
    }
  }
}
