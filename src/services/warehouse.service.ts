import { AppDataSource } from "../config/datasource";
import { Warehouse } from "../entities/Warehouse";

const warehouseRepository = AppDataSource.getRepository(Warehouse);

export class WarehouseService {
  async getAllWarehouses(): Promise<Warehouse[]> {
    return await warehouseRepository.find();
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    return await warehouseRepository.findOne({ where: { id } });
  }

  async createWarehouse(id: string, name: string, location: string): Promise<Warehouse> {
    const warehouse = warehouseRepository.create({ id, name, location });
    return await warehouseRepository.save(warehouse);
  }

  async updateWarehouse(id: string, name: string, location: string): Promise<Warehouse | null> {
    const warehouse = await this.getWarehouseById(id);
    if (!warehouse) return null;

    warehouse.name = name;
    warehouse.location = location;
    return await warehouseRepository.save(warehouse);
  }

  async deleteWarehouse(id: string): Promise<boolean> {
    const result = await warehouseRepository.delete(id);
    return result.affected !== 0;
  }
}
