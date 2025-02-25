import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany
} from "typeorm";
import { UserRoles } from "./UserRoles";
import { RolePermissions } from "./RolePermissions";

@Entity("roles")
export class Role {
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

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles: UserRoles[] | undefined;

  @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.role)
  rolePermissions: RolePermissions[] | undefined;
}
