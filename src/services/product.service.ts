import { ILike, Repository } from "typeorm";
import { AppDataSource } from "../config/datasource";
import { Product } from "../entities/Product";

export class ProductService {
  private productRepository: Repository<Product>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
  }

  // Create a new product
  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return await this.productRepository.save(product);
  }

  // Get all products with optional pagination
  async getProducts(page: number = 1, pageSize: number = 10): Promise<{ products: Product[], total: number }> {
    const [products, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ["batches", "transactionItems"]
    });

    return { products, total };
  }

  // Get a single product by ID
  async getProductById(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({ where: { id }, relations: ["batches", "transactionItems"] });
  }

  // Search products by name or ID with pagination
  async searchProducts(query?: string, category?: string, page: number = 1, pageSize: number = 10): Promise<{ products: Product[], total: number }> {
    const whereClause: any = [];

    if (query) {
      whereClause.push(
        { id: ILike(`%${query}%`) },
        { name: ILike(`%${query}%`) }
      );
    }

    if (category) {
      whereClause.push({ category });
    }

    const [products, total] = await this.productRepository.findAndCount({
      where: query && category ? { category, ...whereClause } : whereClause.length > 0 ? whereClause : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { products, total };
  }

  // Update a product
  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const product = await this.getProductById(id);
    if (!product) return null;

    Object.assign(product, data);
    return await this.productRepository.save(product);
  }

  // Delete a product
  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected !== 0;
  }

  async getAllCategories(): Promise<string[]> {
    const categories = await this.productRepository
      .createQueryBuilder("product")
      .select("DISTINCT product.category", "category") // Get unique categories
      .getRawMany();

    return categories.map(c => c.category);
  }
}
