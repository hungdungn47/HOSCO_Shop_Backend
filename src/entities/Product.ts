import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { ProductBatch } from "./ProductBatch";
import { TransactionItem } from "./TransactionItem";
import { WarehouseStock } from "./WarehouseStock";

export enum DiscountUnit { VND = 'vnd', PERCENTAGE = 'percentage' }

@Entity()
export class Product {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  category: string

  @Column()
  wholesalePrice: number

  @Column()
  retailPrice: number

  @Column()
  stockQuantity: number

  @Column({ default: "item" })
  unit: string

  @Column()
  imageUrl: string

  @Column({ nullable: true })
  description?: string

  @Column({ default: 0 })
  discount: number

  @Column({ type: "varchar", enum: DiscountUnit, default: DiscountUnit.PERCENTAGE })
  discountUnit: string

  @OneToMany(() => ProductBatch, (batch) => batch.product)
  batches: ProductBatch[];

  @OneToMany(() => TransactionItem, (item) => item.product)
  transactionItems: TransactionItem[]

  @OneToMany(() => WarehouseStock, (item) => item.product)
  stock: WarehouseStock
}