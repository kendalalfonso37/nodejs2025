import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number | undefined;

  @Column({ name: "refresh_token", type: "text" })
  refreshToken: string | undefined;

  @CreateDateColumn({
    name: "issued_time",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  issuedTime: Date | undefined;

  @Column({ name: "expiration_time", type: "datetime" })
  expirationTime: Date | undefined;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "user_id" })
  user: User | undefined;
}
