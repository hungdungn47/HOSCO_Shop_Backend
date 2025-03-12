import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { ProductBatch } from "./ProductBatch";
import { WarehouseStock } from "./WarehouseStock";

@Entity()
export class Warehouse {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @OneToMany(() => WarehouseStock, (item) => item.warehouse)
  stock: WarehouseStock
}