import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";
import { ProductBatch } from "./ProductBatch";

@Entity()
@Unique(["product", "warehouse"])
export class WarehouseStock {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: 0 })
  totalQuantity: number;

  @ManyToOne(() => Product, (product) => product.stock, { onDelete: "CASCADE" })
  product: Product;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stock, { onDelete: "CASCADE" })
  warehouse: Warehouse;

  @OneToMany(() => ProductBatch, (batch) => batch.warehouseStock)
  batches: ProductBatch[];
}