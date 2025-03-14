import { ILike, In, Repository } from "typeorm";
import { AppDataSource } from "../config/datasource";
import { Product } from "../entities/Product";
import { WarehouseStock } from "../entities/WarehouseStock";

export class ProductService {
  private productRepository: Repository<Product>;
  private warehouseStockRepository: Repository<WarehouseStock>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
    this.warehouseStockRepository = AppDataSource.getRepository(WarehouseStock);
  }

  // Create a new product
  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return await this.productRepository.save(product);
  }

  // Modified method to get stock quantity for a specific product in all warehouses
  // plus the total quantity across all warehouses
  async getProductStockByProductId(productId: string): Promise<{ warehouseStocks: any[], totalQuantity: number }> {
    const warehouseStocks = await this.warehouseStockRepository.createQueryBuilder("warehouseStock")
      .leftJoinAndSelect("warehouseStock.warehouse", "warehouse")
      .leftJoinAndSelect("warehouseStock.product", "product")
      .where("product.id = :productId", { productId })
      .select([
        "warehouse.id",
        "warehouse.name",
        "warehouseStock.totalQuantity"
      ])
      .getMany();

    // Calculate total quantity across all warehouses
    const totalQuantity = warehouseStocks.reduce((sum, stock) => sum + stock.totalQuantity, 0);

    return {
      warehouseStocks,
      totalQuantity
    };
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
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    if (!query) return [];

    const suggestions = await this.productRepository.query(
      `SELECT DISTINCT TOP 10
          LEFT(name, CHARINDEX(' ', name + ' ', CHARINDEX(@0, name)) - 1) AS suggestion
       FROM product
       WHERE name LIKE @0 + '%'
       GROUP BY LEFT(name, CHARINDEX(' ', name + ' ', CHARINDEX(@0, name)) - 1)
       ORDER BY name`,
      [query]
    );

    return suggestions.map((row: { suggestion: string }) => row.suggestion);
  }
}
