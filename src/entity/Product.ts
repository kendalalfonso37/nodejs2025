import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Category } from "./Category";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number | undefined;

  @Column({ type: "text", nullable: true })
  name: string | undefined;

  @Column({ type: "text", nullable: true })
  description: string | undefined;

  @Column({ name: "quantity_per_unit", type: "text", nullable: true })
  quantityPerUnit: string | undefined;

  @Column({ name: "unit_price", type: "decimal", nullable: true })
  unitPrice: number | undefined;

  @Column({ name: "units_in_stock", type: "integer", nullable: true })
  unitsInStock: number | undefined;

  @Column({ name: "units_on_order", type: "integer", nullable: true })
  unitsOnOrder: number | undefined;

  @Column({ name: "is_active", type: "boolean", nullable: false, default: () => "1" })
  isActive: boolean | undefined = true;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  createdAt: Date | undefined;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  updatedAt: Date | undefined;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp",
    nullable: true,
    default: () => "NULL"
  })
  deletedAt: Date | undefined;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "category_id" })
  category: Category | undefined;
}
