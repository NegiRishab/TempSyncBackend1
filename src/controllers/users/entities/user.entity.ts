import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Base } from "../../../common/entities/base.entity";
import { Organization } from "../../organization/entities/organization.entity";

@Entity("users")
export class UserEntity extends Base {
  @Column({ type: "varchar", nullable: false })
  first_name: string;

  @Column({ type: "varchar", nullable: false })
  last_name: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true, select: false })
  password: string;

  @Column({ type: "varchar", nullable: false })
  role: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @Column({ type: "boolean", nullable: false, default: true })
  is_active: boolean;

  @Column({ type: "varchar", nullable: true })
  profile_image_url: string;
}
