import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { Partner } from "./Partner";
import { Warehouse } from "./Warehouse";

@Entity()
export class ProductBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  batchNumber: string;

  @Column("date")
  expiryDate: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  purchasePrice: number;

  @ManyToOne(() => Product, (product) => product.batches)
  product: Product;

  @ManyToOne(() => Partner, (partner) => partner.suppliedBatches)
  supplier: Partner;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.batches)
  warehouse: Warehouse;
}
