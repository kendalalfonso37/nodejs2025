import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Role } from "./Role";

@Entity()
export class UserRoles {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number | undefined;

  @ManyToOne(() => User, (user) => user.userRoles, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "user_id" })
  user: User | undefined;

  @ManyToOne(() => Role, (role) => role.userRoles, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "role_id" })
  role: Role | undefined;
}
