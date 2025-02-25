import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { RolePermissions } from "./RolePermissions";
import { Route } from "./Route";
import { Group } from "./Group";

@Entity("permissions")
export class Permission {
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

  @ManyToOne(() => Group, (group) => group.permission, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "group_id" })
  group: Group | undefined;

  @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.permission)
  rolePermissions: RolePermissions[] | undefined;

  @OneToMany(() => Route, (route) => route.permission)
  route: Route[] | undefined;
}
