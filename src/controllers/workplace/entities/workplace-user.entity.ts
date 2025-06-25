import { UserEntity } from "src/controllers/users/entities/user.entity";
import { Workplace } from "src/controllers/workplace/entities/workplace.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  Unique,
} from "typeorm";

@Entity()
@Unique(["user", "workplace"])
export class WorkplaceUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.workplaceMemberships, {
    eager: true,
    onDelete: "CASCADE",
  })
  user: UserEntity;

  @ManyToOne(() => Workplace, (wp) => wp.members, { onDelete: "CASCADE" })
  workplace: Workplace;

  @Column({ default: false })
  isOwner: boolean;

  @CreateDateColumn()
  joinedAt: Date;
}
