import { Base } from "src/common/entities/base.entity";
import { UserEntity } from "src/controllers/users/entities/user.entity";
import { Workplace } from "src/controllers/workplace/entities/workplace.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity("organizations")
export class Organization extends Base {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "boolean", nullable: false, default: false })
  is_deleted: boolean;

  @OneToMany(() => UserEntity, (user) => user.organization)
  users: UserEntity[];

  @OneToMany(() => Workplace, (wp) => wp.organization)
  workplaces: Workplace[];
}
