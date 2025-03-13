import { ILike, In, Repository } from "typeorm";
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

  async searchProducts(
    query?: string,
    categories?: string[],
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ products: Product[], total: number }> {
    // Build where clause
    let whereClause: any = {};

    // Handle text search condition (OR between text fields)
    if (query) {
      whereClause = [
        { id: ILike(`%${query}%`) },
        { name: ILike(`%${query}%`) }
      ];
    }

    // Handle categories condition
    if (categories && categories.length > 0) {
      // If we already have query conditions, we need to add the category condition to each
      if (query) {
        whereClause = whereClause.map((condition: any) => ({
          ...condition,
          category: In(categories)
        }));
      } else {
        // If no query, just filter by categories
        whereClause = { category: In(categories) };
      }
    }

    // Execute the query
    const [products, total] = await this.productRepository.findAndCount({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { products, total };
  }


  async searchProductsNameAndId(query?: string, category?: string, page: number = 1, pageSize: number = 10) {
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
    const products = await this.productRepository.find({
      select: ['id', 'name'],
      where: query && category ? { category, ...whereClause } : whereClause.length > 0 ? whereClause : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return products;
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
