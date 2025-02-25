import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany
} from "typeorm";
import { Permission } from "./Permission";

@Entity("groups")
export class Group {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number | undefined;

  @Column({ type: "text", nullable: false })
  name: string | undefined;

  @Column({ type: "text", nullable: false })
  description: string | undefined;

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

  @OneToMany(() => Permission, (permission) => permission.group)
  permission: Permission[] | undefined;
}
