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
  ip_address: string;

  @Column({ type: "varchar", nullable: true })
  user_agent: string;

  @Column({ type: "boolean", default: false })
  is_revoked: boolean;

  @Column({ type: "timestamp", nullable: false })
  created_at: Date;

  @Column({ type: "timestamp", nullable: false })
  expires_at: Date;
}
