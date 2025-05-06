import { Base } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

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
  isDeleted: boolean;
}
