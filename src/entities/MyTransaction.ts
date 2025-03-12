import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Partner } from "./Partner";
import { DiscountUnit } from "./Product";
import { TransactionItem } from "./TransactionItem";

export enum TransactionType {
  SALE = "sale",
  PURCHASE = "purchase"
}

export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card"
}

@Entity()
export class MyTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("date")
  transactionDate: Date;

  @Column({ type: "enum", enum: TransactionType, default: TransactionType.SALE })
  type: string

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  vat: number;

  @Column({ default: 0 })
  discount: number

  @Column({ type: "enum", enum: DiscountUnit, default: DiscountUnit.PERCENTAGE })
  discountUnit: string

  @ManyToOne(() => Partner, (partner) => partner.transactions, { nullable: true })
  partner: Partner;

  @OneToMany(() => TransactionItem, (item) => item.transaction)
  items: TransactionItem[]
}
