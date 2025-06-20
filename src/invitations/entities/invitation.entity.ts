// src/invitations/entities/invitation.entity.ts

import { Organization } from "src/controllers/organization/entities/organization.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => Organization, { eager: true })
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ default: "pending" })
  status: "pending" | "used" | "expired";

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
