import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./Role";
import { Permission } from "./Permission";

@Entity()
export class RolePermissions {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number | undefined;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "role_id" })
  role: Role | undefined;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "permission_id" })
  permission: Permission | undefined;
}
