import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MyTransaction } from "./MyTransaction";
import { DiscountUnit, Product } from "./Product";

@Entity()
export class TransactionItem {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => MyTransaction, (transaction) => transaction.items)
  transaction: MyTransaction

  @ManyToOne(() => Product, (product) => product.transactionItems)
  product: Product

  @Column()
  quantity: number

  @Column()
  unitPrice: number

  @Column({ default: 0 })
  discount: number

  @Column({ type: "varchar", enum: DiscountUnit })
  discountUnit: string

  @Column()
  subtotal: number
}