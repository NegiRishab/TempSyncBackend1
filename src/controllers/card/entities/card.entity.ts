import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CardStatus } from "src/common/enums";
import { Workplace } from "src/controllers/workplace/entities/workplace.entity";
import { UserEntity } from "src/controllers/users/entities/user.entity";

@Entity()
export class Card {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: CardStatus,
    default: CardStatus.PENDING,
  })
  status: CardStatus;

  @ManyToOne(() => Workplace, (wp) => wp.cards, { onDelete: "CASCADE" })
  workplace: Workplace;

  @ManyToOne(() => UserEntity, (user) => user.assignedCards, {
    nullable: true,
    onDelete: "SET NULL",
  })
  assignee: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.createdCards, { onDelete: "SET NULL" })
  createdBy: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
