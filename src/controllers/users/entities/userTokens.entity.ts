import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("refresh_tokens")
export class UserTokensEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ type: "varchar", nullable: false })
  token: string;

  @Column({ type: "varchar", nullable: true })
  ipAddress: string;

  @Column({ type: "varchar", nullable: true })
  userAgent: string;

  @Column({ type: "boolean", default: false })
  isRevoked: boolean;

  @Column({ type: "timestamp", nullable: false })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: false })
  expiresAt: Date;
}
