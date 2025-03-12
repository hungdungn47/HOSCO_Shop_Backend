import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { ProductBatch } from "./ProductBatch";

@Entity()
export class Warehouse {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @OneToMany(() => ProductBatch, (batch) => batch.warehouse)
  batches: ProductBatch[];
}