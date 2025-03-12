import { AppDataSource } from "./config/datasource"; // Your TypeORM data source
import { Product } from "./entities/Product";
import { DataSource } from "typeorm";

const categories = [
  "Electronics",
  "Home Appliances",
  "Clothing & Apparel",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Automotive & Accessories",
  "Health & Wellness",
  "Books & Stationery",
  "Toys & Games",
  "Groceries & Beverages",
];

const IMAGE_URL =
  "https://help.rangeme.com/hc/article_attachments/360006928633/what_makes_a_good_product_image.jpg";

// Function to generate random price
const getRandomPrice = () => Math.floor(Math.random() * (650000 - 150000) + 150000);

// Function to generate products for a category
const generateProducts = (category: string) => {
  return Array.from({ length: 5000 }, (_, i) => {
    const id = `${category.substring(0, 3).toUpperCase()}${i + 1}`; // Unique ID based on category
    const wholesalePrice = getRandomPrice()
    return {
      id,
      name: `${category} Product ${i + 1}`,
      category,
      wholesalePrice: wholesalePrice,
      retailPrice: wholesalePrice * 130 / 100,
      stockQuantity: Math.floor(Math.random() * 100) + 1, // Random stock between 1-100
      unit: "item",
      imageUrl: IMAGE_URL,
      description: `Description for ${category} Product ${i + 1}`,
      discount: 0,
      discountUnit: "percentage",
    };
  });
};

// Function to insert products category by category
const insertProductsByCategory = async () => {
  for (const category of categories) {
    const dataSource = new DataSource(AppDataSource.options); // Create a new connection
    await dataSource.initialize(); // Open connection
    console.log(`✅ Connected to database for category: ${category}`);

    const productRepo = dataSource.getRepository(Product);
    const products = generateProducts(category);

    try {
      for (let i = 0; i < products.length; i += 100) {
        const batch = products.slice(i, i + 100); // Insert in batches of 500
        await productRepo.insert(batch);
        console.log(`Inserted ${i + batch.length}/${products.length} products for ${category}`);
      }
    } catch (error) {
      console.error(`❌ Error inserting products for ${category}:`, error);
    } finally {
      await dataSource.destroy(); // Close connection
      console.log(`🔴 Connection closed for category: ${category}`);
    }
  }

  console.log("✅ All categories processed!");
};

insertProductsByCategory().catch(console.error);
