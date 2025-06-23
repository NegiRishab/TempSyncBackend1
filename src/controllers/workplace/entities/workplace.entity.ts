import { Card } from "src/controllers/card/entities/card.entity";
import { Organization } from "src/controllers/organization/entities/organization.entity";
import { WorkplaceUser } from "src/controllers/workplace-user/entities/workplace-user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Workplace {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Organization, (org) => org.workplaces, {
    onDelete: "CASCADE",
  })
  organization: Organization;

  @OneToMany(() => WorkplaceUser, (wu) => wu.workplace)
  members: WorkplaceUser[];

  @OneToMany(() => Card, (card) => card.workplace)
  cards: Card[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
