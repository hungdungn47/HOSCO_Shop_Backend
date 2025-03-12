import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Warehouse {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;
}