import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Permission } from "./Permission";

@Entity("routes")
export class Route {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number | undefined;

  @Column({ type: "text", nullable: true })
  name: string | undefined;

  @Column({ type: "text", nullable: true })
  description: string | undefined;

  @Column({ type: "text", nullable: false })
  path: string | undefined;

  @Column({ type: "text", nullable: true })
  icon: string | undefined;

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

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "permission_id" })
  permission: Permission | undefined;
}
