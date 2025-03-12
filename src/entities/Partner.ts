import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductBatch } from "./ProductBatch";
import { MyTransaction } from "./MyTransaction";

export enum PartnerRole {
  WHOLESALE_CUSTOMER = "wholesale_customer",
  RETAIL_CUSTOMER = "retail_customer",
  SUPPLIER = "supplier",
  CUSTOMER_SUPPLIER = "customer-supplier",
}

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  phone: string

  @Column()
  email: string

  @Column()
  address: string

  @Column({
    type: "enum",
    enum: PartnerRole,
    default: PartnerRole.RETAIL_CUSTOMER,
  })
  role: PartnerRole;

  @OneToMany(() => ProductBatch, (batch) => batch.supplier)
  suppliedBatches: ProductBatch[];

  @OneToMany(() => MyTransaction, (transaction) => transaction.partner)
  transactions: MyTransaction[];
}